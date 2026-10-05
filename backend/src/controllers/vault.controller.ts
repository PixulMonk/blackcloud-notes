import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import { Note } from "../models/note.model";
import { TreeNode } from "../models/treeNode.model";
import {
  GetNotesForExportRequest,
  GetNotesForExportResponse,
  VaultImportRequest,
  VaultImportResponse,
} from "../types/vault.types";

// TODO: ugh rename this shit

export const getNotesForExport = asyncHandler(
  async (
    req: GetNotesForExportRequest,
    res: Response<GetNotesForExportResponse>,
  ): Promise<void> => {
    const userId = req.user?._id;

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const userNotes = await Note.find({ userId })
      .select("_id encryptedContent")
      .lean();

    const exportNotes = userNotes.map((note) => ({
      _id: note._id.toString(),
      // Exporting encryptedContent as an empty string if it's undefined to ensure consistent data structure
      // This is important for the frontend to handle the data correctly without running into undefined values.
      encryptedContent: note.encryptedContent ?? "",
    }));

    res.status(200).json({
      success: true,
      message: "Notes retrieved successfully for export",
      notes: exportNotes,
    });
  },
);

export const importVault = asyncHandler(
  async (
    req: Request<{}, VaultImportResponse, VaultImportRequest>,
    res: Response<VaultImportResponse>,
  ): Promise<void> => {
    const userId = req.user?._id;
    if (!userId) throw new Error("Unauthorized");

    const { importRootId, nodes, notes } = req.body;
    if (!Array.isArray(nodes) || !Array.isArray(notes)) {
      res.status(400).json({
        success: false,
        imported: { nodes: 0, notes: 0 },
        errors: [{ id: "", reason: "Malformed import payload" }],
      });
      return;
    }

    const errors: VaultImportResponse["errors"] = [];

    // 1. Insert notes first — nodes depend on them, not the other way around
    const noteDocs = notes.map((n) => ({
      _id: n._id,
      userId,
      encryptedContent: n.encryptedContent,
    }));
    const insertedNoteIds = new Set<string>();

    try {
      const result = await Note.insertMany(noteDocs, { ordered: false });
      result.forEach((n) => insertedNoteIds.add(n._id.toString()));
    } catch (err: any) {
      // ordered:false still inserts what it can; successes aren't in err.writeErrors
      (err.insertedDocs ?? []).forEach((n: any) =>
        insertedNoteIds.add(n._id.toString()),
      );
      for (const we of err.writeErrors ?? []) {
        errors.push({
          id: we.err?.op?._id ?? "unknown",
          reason: "Failed to import note",
        });
      }
    }

    // 2. Only insert file-type nodes whose note actually landed — prevents orphaned pointers
    const nodeDocs = nodes
      .filter((n) => {
        if (n.type !== "file") return true; // folders have no note dependency
        const ok = n.fileId && insertedNoteIds.has(n.fileId);
        if (!ok) {
          errors.push({
            id: n._id,
            reason: "Skipped — underlying note failed to import",
          });
        }
        return ok;
      })
      .map((n) => ({
        _id: n._id,
        userId,
        parentId: n.parentId,
        type: n.type,
        encryptedTitle: n.encryptedTitle,
        fileId: n.fileId,
      }));

    let importedNodeCount = 0;
    const insertedNodeIds = new Set<string>();
    try {
      const result = await TreeNode.insertMany(nodeDocs, { ordered: false });
      result.forEach((n) => insertedNodeIds.add(n._id.toString()));
      importedNodeCount = result.length;
    } catch (err: any) {
      (err.insertedDocs ?? []).forEach((n: any) =>
        insertedNodeIds.add(n._id.toString()),
      );
      importedNodeCount = insertedNodeIds.size;
      for (const we of err.writeErrors ?? []) {
        errors.push({
          id: we.err?.op?._id ?? "unknown",
          reason: "Failed to import folder/file node",
        });
      }
    }

    // Second pass: re-parent any inserted node whose parent didn't make it in.
    // Can happen if a folder failed insertMany validation but its children still succeeded.
    const orphans = await TreeNode.find({
      _id: { $in: Array.from(insertedNodeIds) },
      userId,
      parentId: { $nin: [null, importRootId] },
    });

    for (const node of orphans) {
      const parentStillExists = insertedNodeIds.has(node.parentId!.toString());
      if (parentStillExists) continue; // parent is fine, not actually an orphan

      await TreeNode.updateOne(
        { _id: node._id, userId },
        { $set: { parentId: importRootId } },
      );
      errors.push({
        id: node._id.toString(),
        reason: `Parent folder failed to import — re-parented to import root`,
      });
    }

    res.status(200).json({
      success: true,
      imported: { nodes: importedNodeCount, notes: insertedNoteIds.size },
      errors,
    });
  },
);
