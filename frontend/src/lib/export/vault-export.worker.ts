/// <reference lib="webworker" />
import JSZip from "jszip";

import { decryptAESGCM } from "@/lib/crypto/aes";
import { jsonToMarkdown } from "@/lib/renderer/jsonToMarkdown";
import { sanitizeFilename } from "@/utils/sanitizeFileName";

import type {
  WorkerOutMessage,
  ExportNoteDTO,
  ExportTreeNode,
  StartExportMessage,
  ExportFormat,
  DoneMessage,
} from "@/types/export.types";

function post(msg: WorkerOutMessage) {
  (self as DedicatedWorkerGlobalScope).postMessage(msg);
}

function dedupeFilename(usedNames: Set<string>, filename: string): string {
  if (!usedNames.has(filename)) {
    usedNames.add(filename);
    return filename;
  }
  const dotIndex = filename.lastIndexOf(".");
  const ext = dotIndex !== -1 ? filename.slice(dotIndex) : "";
  const base = dotIndex !== -1 ? filename.slice(0, dotIndex) : filename;
  let i = 1;
  let candidate = `${base} (${i})${ext}`;
  while (usedNames.has(candidate)) {
    i += 1;
    candidate = `${base} (${i})${ext}`;
  }
  usedNames.add(candidate);
  return candidate;
}

// Decrypts a note and serializes it per the requested format.
// Returns both the content string and the file extension to use.
async function decryptNoteContent(
  note: ExportNoteDTO,
  dek: Uint8Array,
  format: ExportFormat,
): Promise<{ content: string; ext: string }> {
  if (!note.encryptedContent) {
    return {
      content: format === "markdown" ? "" : "{}",
      ext: format === "markdown" ? "md" : "json",
    };
  }
  const plaintext = await decryptAESGCM(note.encryptedContent, dek);
  const json = JSON.parse(plaintext);

  if (format === "markdown") {
    return { content: jsonToMarkdown(json), ext: "md" };
  }
  return { content: JSON.stringify(json, null, 2), ext: "json" };
}

function safeFolderTitle(title: unknown): string {
  if (typeof title !== "string" || title.length === 0)
    return "Corrupted Folder";
  try {
    return sanitizeFilename(title);
  } catch {
    return "Corrupted Folder";
  }
}

async function processFileNode(
  node: ExportTreeNode,
  path: string[],
  noteMap: Map<string, ExportNoteDTO>,
  zipFolder: JSZip,
  dek: Uint8Array,
  format: ExportFormat,
  usedNames: Set<string>,
  errors: DoneMessage["errors"],
) {
  if (!node.fileId) return;
  const note = noteMap.get(node.fileId);
  const fullPath = [...path, node.title].join(" / ");

  if (!note) {
    errors.push({
      noteId: node.fileId,
      title: node.title,
      reason: `Note content missing from bulk fetch — location: ${fullPath}`,
    });
    return;
  }

  try {
    const { content, ext } = await decryptNoteContent(note, dek, format);
    const filename = dedupeFilename(
      usedNames,
      `${sanitizeFilename(node.title)}.${ext}`,
    );
    zipFolder.file(filename, content);
  } catch (err) {
    errors.push({
      noteId: node.fileId,
      title: node.title,
      reason: `${err instanceof Error ? err.message : "Unknown error"} — location: ${fullPath}`,
    });
  }
}

async function walkTree(
  nodes: ExportTreeNode[],
  path: string[],
  noteMap: Map<string, ExportNoteDTO>,
  zipFolder: JSZip,
  dek: Uint8Array,
  format: ExportFormat,
  usedNames: Set<string>,
  errors: DoneMessage["errors"],
  progress: { completed: number; total: number },
) {
  for (const node of nodes) {
    if (node.type === "folder") {
      const safeName = safeFolderTitle(node.title);
      const folder = zipFolder.folder(safeName)!;
      const childUsedNames = new Set<string>();
      if (node.children?.length) {
        await walkTree(
          node.children,
          [...path, safeName],
          noteMap,
          folder,
          dek,
          format,
          childUsedNames,
          errors,
          progress,
        );
      }
      continue;
    }

    await processFileNode(
      node,
      path,
      noteMap,
      zipFolder,
      dek,
      format,
      usedNames,
      errors,
    );
    progress.completed += 1;
    post({
      type: "progress",
      completed: progress.completed,
      total: progress.total,
    });
  }
}

function countFiles(nodes: ExportTreeNode[]): number {
  let count = 0;
  for (const node of nodes) {
    if (node.type === "file") count += 1;
    if (node.children?.length) count += countFiles(node.children);
  }
  return count;
}

self.onmessage = async (event: MessageEvent<StartExportMessage>) => {
  const { type, format, dek, tree, archivedNodes, notes } = event.data;
  if (type !== "start") return;

  try {
    const zip = new JSZip();
    const noteMap = new Map(notes.map((n) => [n._id, n]));
    const errors: DoneMessage["errors"] = [];

    const totalFiles =
      countFiles(tree) + archivedNodes.filter((n) => n.type === "file").length;
    const progress = { completed: 0, total: totalFiles };

    await walkTree(
      tree,
      [],
      noteMap,
      zip,
      dek,
      format,
      new Set(),
      errors,
      progress,
    );

    if (archivedNodes.length) {
      const archivedFolder = zip.folder("Archived")!;
      const archivedUsedNames = new Set<string>();
      for (const node of archivedNodes) {
        if (node.type !== "file") continue;
        await processFileNode(
          node,
          [],
          noteMap,
          archivedFolder,
          dek,
          format,
          archivedUsedNames,
          errors,
        );
        progress.completed += 1;
        post({
          type: "progress",
          completed: progress.completed,
          total: progress.total,
        });
      }
    }

    if (errors.length) {
      zip.file(
        "errors.txt",
        errors.map((e) => `${e.title} (${e.noteId}): ${e.reason}`).join("\n"),
      );
    }

    const blob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
    });
    post({ type: "done", blob, errors });
  } catch (err) {
    post({
      type: "error",
      message: err instanceof Error ? err.message : "Export failed",
    });
  }
};
