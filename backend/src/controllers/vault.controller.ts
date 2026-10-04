import { Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import { Note } from "../models/note.model";
import {
  GetNotesForExportRequest,
  GetNotesForExportResponse,
} from "../types/vault.types";

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

export const importNotes = asyncHandler(
  async (
    req: GetNotesForExportRequest,
    res: Response<GetNotesForExportResponse>,
  ): Promise<void> => {
    const userId = req.user?._id;

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Placeholder for import logic
    // This function should handle the import of notes into the user's vault.
    // The actual implementation will depend on the data format and requirements.

    res.status(200).json({
      success: true,
      message: "Import functionality is not yet implemented.",
      notes: [],
    });
  },
);
