/// <reference lib="webworker" />
import JSZip from "jszip";

import type {
  DoneMessage,
  ExportNoteDTO,
  ExportTreeNode,
  StartExportMessage,
  WorkerOutMessage,
} from "@/types/export.types";
import { decryptAESGCM } from "@/lib/crypto/aes";
import { jsonToMarkdown } from "@/lib/renderer/jsonToMarkdown";
import { sanitizeFilename } from "@/utils/sanitizeFileName";

function post(msg: WorkerOutMessage) {
  (self as DedicatedWorkerGlobalScope).postMessage(msg);
}

function dedupeFilename(usedNames: Set<string>, filename: string): string {
  if (!usedNames.has(filename)) {
    usedNames.add(filename);
    return filename;
  }
  const ext = filename.endsWith(".md") ? ".md" : "";
  const base = ext ? filename.slice(0, -ext.length) : filename;
  let i = 1;
  let candidate = `${base} (${i})${ext}`;
  while (usedNames.has(candidate)) {
    i += 1;
    candidate = `${base} (${i})${ext}`;
  }
  usedNames.add(candidate);
  return candidate;
}

async function decryptNoteMarkdown(
  note: ExportNoteDTO,
  dek: Uint8Array,
): Promise<string> {
  if (!note.encryptedContent) return "";
  const plaintext = await decryptAESGCM(note.encryptedContent, dek);
  const json = JSON.parse(plaintext);
  return jsonToMarkdown(json);
}

async function walkTree(
  nodes: ExportTreeNode[],
  noteMap: Map<string, ExportNoteDTO>,
  zipFolder: JSZip,
  dek: Uint8Array,
  usedNames: Set<string>,
  errors: DoneMessage["errors"],
  progress: { completed: number; total: number },
) {
  for (const node of nodes) {
    if (node.type === "folder") {
      const folder = zipFolder.folder(sanitizeFilename(node.title))!;
      const childUsedNames = new Set<string>();
      if (node.children?.length) {
        await walkTree(
          node.children,
          noteMap,
          folder,
          dek,
          childUsedNames,
          errors,
          progress,
        );
      }
      continue;
    }

    // type === 'file'
    progress.completed += 1;
    post({
      type: "progress",
      completed: progress.completed,
      total: progress.total,
    });

    if (!node.fileId) continue; // malformed node — skip rather than crash the export
    const note = noteMap.get(node.fileId);
    if (!note) {
      errors.push({
        noteId: node.fileId,
        title: node.title,
        reason: "Note content missing from bulk fetch",
      });
      continue;
    }

    try {
      const markdown = await decryptNoteMarkdown(note, dek);
      const filename = dedupeFilename(
        usedNames,
        `${sanitizeFilename(node.title)}.md`,
      );
      zipFolder.file(filename, markdown);
    } catch (err) {
      errors.push({
        noteId: node.fileId,
        title: node.title,
        reason: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }
}

self.onmessage = async (event: MessageEvent<StartExportMessage>) => {
  const { type, dek, tree, archivedNodes, notes } = event.data;
  if (type !== "start") return;

  try {
    const zip = new JSZip();
    const noteMap = new Map(notes.map((n) => [n._id, n]));
    const errors: DoneMessage["errors"] = [];

    const totalFiles =
      countFiles(tree) + archivedNodes.filter((n) => n.type === "file").length;
    const progress = { completed: 0, total: totalFiles };

    // main tree
    await walkTree(tree, noteMap, zip, dek, new Set(), errors, progress);

    // archived notes — flat, own top-level folder
    if (archivedNodes.length) {
      const archivedFolder = zip.folder("Archived")!;
      const archivedUsedNames = new Set<string>();
      for (const node of archivedNodes) {
        if (node.type !== "file") continue; // skip stray archived folders — no children to export from them anyway
        progress.completed += 1;
        post({
          type: "progress",
          completed: progress.completed,
          total: progress.total,
        });

        if (!node.fileId) continue;
        const note = noteMap.get(node.fileId);
        if (!note) {
          errors.push({
            noteId: node.fileId,
            title: node.title,
            reason: "Note content missing from bulk fetch",
          });
          continue;
        }
        try {
          const markdown = await decryptNoteMarkdown(note, dek);
          const filename = dedupeFilename(
            archivedUsedNames,
            `${sanitizeFilename(node.title)}.md`,
          );
          archivedFolder.file(filename, markdown);
        } catch (err) {
          errors.push({
            noteId: node.fileId,
            title: node.title,
            reason: err instanceof Error ? err.message : "Unknown error",
          });
        }
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

function countFiles(nodes: ExportTreeNode[]): number {
  let count = 0;
  for (const node of nodes) {
    if (node.type === "file") count += 1;
    if (node.children?.length) count += countFiles(node.children);
  }
  return count;
}
