import JSZip from "jszip";
import ObjectID from "bson-objectid";
import type { JSONContent } from "@tiptap/core";

import { encryptAESGCM } from "@/lib/crypto/aes";
import type {
  ImportTreeNode,
  ImportNote,
  VaultImportRequest,
} from "@/types/import.types";

import { markdownToJson } from "./markdownToJson";
import { sanitizeMarkdownInput } from "./sanitizeMarkdownInput";

interface ZipEntryNode {
  type: "folder" | "file";
  name: string;
  children: ZipEntryNode[];
  fileData?: string; // raw JSON string, files only
}

function isValidTiptapDoc(value: unknown): value is JSONContent {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { type?: unknown }).type === "doc" &&
    Array.isArray((value as { content?: unknown }).content)
  );
}

interface SkippedEntry {
  path: string;
  reason: string;
}

export async function buildImportPayload(
  zipFile: File,
  dek: Uint8Array,
): Promise<{ payload: VaultImportRequest; skipped: SkippedEntry[] }> {
  const zip = await JSZip.loadAsync(zipFile);
  const skipped: SkippedEntry[] = [];
  const root: ZipEntryNode = { type: "folder", name: "", children: [] };

  for (const entry of Object.values(zip.files)) {
    if (entry.dir) continue;

    const isJson = entry.name.endsWith(".json");
    const isMd = entry.name.endsWith(".md");
    if (!isJson && !isMd) continue; // skip errors.txt, images, anything else

    const parts = entry.name.split("/");
    let current = root;
    for (let i = 0; i < parts.length - 1; i++) {
      const segment = parts[i];
      let folder = current.children.find(
        (c) => c.type === "folder" && c.name === segment,
      );
      if (!folder) {
        folder = { type: "folder", name: segment, children: [] };
        current.children.push(folder);
      }
      current = folder;
    }

    const title = parts[parts.length - 1].replace(/\.(json|md)$/, "");
    const raw = await entry.async("string");

    let docJson: JSONContent;
    if (isJson) {
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        skipped.push({ path: entry.name, reason: "Invalid JSON" });
        continue;
      }
      if (!isValidTiptapDoc(parsed)) {
        skipped.push({
          path: entry.name,
          reason: "Not a recognized note document",
        });
        continue;
      }
      docJson = parsed;
    } else {
      try {
        docJson = markdownToJson(sanitizeMarkdownInput(raw));
      } catch {
        skipped.push({ path: entry.name, reason: "Could not parse Markdown" });
        continue;
      }
    }

    current.children.push({
      type: "file",
      name: title,
      children: [],
      fileData: JSON.stringify(docJson),
    });
  }

  const nodes: ImportTreeNode[] = [];
  const notes: ImportNote[] = [];

  const importRootId = new ObjectID().toHexString();
  nodes.push({
    _id: importRootId,
    parentId: null,
    type: "folder",
    encryptedTitle: await encryptAESGCM(
      `Imported ${new Date().toISOString().slice(0, 10)}`,
      dek,
    ),
  });

  async function walk(zipNode: ZipEntryNode, parentId: string) {
    for (const child of zipNode.children) {
      const nodeId = new ObjectID().toHexString();

      if (child.type === "folder") {
        nodes.push({
          _id: nodeId,
          parentId,
          type: "folder",
          encryptedTitle: await encryptAESGCM(child.name, dek),
        });
        await walk(child, nodeId);
      } else {
        const noteId = new ObjectID().toHexString();
        notes.push({
          _id: noteId,
          encryptedContent: await encryptAESGCM(child.fileData!, dek),
        });
        nodes.push({
          _id: nodeId,
          parentId,
          type: "file",
          encryptedTitle: await encryptAESGCM(child.name, dek),
          fileId: noteId,
        });
      }
    }
  }

  await walk(root, importRootId);

  return { payload: { importRootId, nodes, notes }, skipped };
}
