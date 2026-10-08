import JSZip from "jszip";
import ObjectID from "bson-objectid";
import type { JSONContent } from "@tiptap/core";

import { encryptAESGCM } from "@/lib/crypto/aes";
import { parseFileEntry, isParseFailure } from "@/lib/import/parseFileEntry";
import type {
  ImportTreeNode,
  ImportNote,
  VaultImportRequest,
} from "@/types/import.types";

interface ZipEntryNode {
  type: "folder" | "file";
  name: string;
  children: ZipEntryNode[];
  docJson?: JSONContent;
}

interface SkippedEntry {
  path: string;
  reason: string;
}

async function buildRootFromZip(
  zipFile: File,
  skipped: SkippedEntry[],
): Promise<ZipEntryNode> {
  const zip = await JSZip.loadAsync(zipFile);
  const root: ZipEntryNode = { type: "folder", name: "", children: [] };

  const IGNORED_ZIP_ENTRIES = [
    /^__MACOSX\//,
    /(^|\/)\.DS_Store$/,
    /(^|\/)Thumbs\.db$/,
    /(^|\/)errors\.txt$/,
  ];

  for (const entry of Object.values(zip.files)) {
    if (entry.dir) continue;
    if (IGNORED_ZIP_ENTRIES.some((re) => re.test(entry.name))) continue;

    if (!entry.name.endsWith(".json") && !entry.name.endsWith(".md")) {
      skipped.push({ path: entry.name, reason: "Unsupported file type" });
      continue;
    }

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

    const raw = await entry.async("string");
    const result = parseFileEntry(entry.name, raw);
    if (isParseFailure(result)) {
      skipped.push(result);
      continue;
    }
    current.children.push({
      type: "file",
      name: result.title,
      children: [],
      docJson: result.docJson,
    });
  }

  return root;
}

// Loose files have no shared directory — everything lands flat, directly
// under the import root, with no folder reconstruction.
async function buildRootFromLooseFiles(
  files: File[],
  skipped: SkippedEntry[],
): Promise<ZipEntryNode> {
  const root: ZipEntryNode = { type: "folder", name: "", children: [] };

  for (const file of files) {
    const raw = await file.text();
    const result = parseFileEntry(file.name, raw);
    if (isParseFailure(result)) {
      skipped.push(result);
      continue;
    }
    root.children.push({
      type: "file",
      name: result.title,
      children: [],
      docJson: result.docJson,
    });
  }

  return root;
}

export async function buildImportPayload(
  input: FileList,
  dek: Uint8Array,
): Promise<{ payload: VaultImportRequest; skipped: SkippedEntry[] }> {
  const files = Array.from(input);
  const skipped: SkippedEntry[] = [];

  const isSingleZip = files.length === 1 && files[0].name.endsWith(".zip");
  const root = isSingleZip
    ? await buildRootFromZip(files[0], skipped)
    : await buildRootFromLooseFiles(
        files.filter((f) => {
          const ok = f.name.endsWith(".md") || f.name.endsWith(".json");
          if (!ok) {
            skipped.push({
              path: f.name,
              reason: f.name.endsWith(".zip")
                ? "Zip files can't be combined with other files — import it on its own"
                : "Unsupported file type",
            });
          }
          return ok;
        }),
        skipped,
      );

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
          encryptedContent: await encryptAESGCM(
            JSON.stringify(child.docJson),
            dek,
          ),
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
