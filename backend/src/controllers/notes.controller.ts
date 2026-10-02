import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";

import { ENCRYPTION_CONFIG } from "@blackcloud/shared";
import asyncHandler from "../utils/asyncHandler";
import { Note } from "../models/note.model";
import {
  CreateNoteRequest,
  DeleteNoteParams,
  GetAllNotesRequest,
  GetNoteParams,
  NoteResponse,
  UpdateNoteParams,
  UpdateNoteRequest,
  GetNotesForExportRequest,
  GetNotesForExportResponse,
} from "../types/notes.types";

export const getAllNotes = asyncHandler(
  async (
    req: GetAllNotesRequest,
    res: Response<NoteResponse>,
  ): Promise<void> => {
    const userId = req.user?._id;

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const userNotes = await Note.find({ userId });

    res.status(200).json({
      success: true,
      message: "Notes retrieved successfully",
      note: userNotes,
    });
  },
);

export const getNote = asyncHandler(
  async (
    req: Request<ParamsDictionary & GetNoteParams, NoteResponse, {}>,
    res: Response<NoteResponse>,
  ): Promise<void> => {
    const noteId = req.params.id;

    if (!noteId) {
      throw new Error("Note ID is required");
    }

    const note = await Note.findOne({ _id: noteId, userId: req.user?._id });

    if (!note) {
      throw new Error("Note not found");
    }

    res.status(200).json({
      success: true,
      message: "Note retrieved successfully",
      note: note,
    });
  },
);

export const createNote = asyncHandler(
  async (
    req: Request<{}, NoteResponse, CreateNoteRequest>,
    res: Response<NoteResponse>,
  ): Promise<void> => {
    const { encryptedContent } = req.body ?? {};

    if (!req.user?._id) {
      throw new Error("User not authenticated");
    }

    const newNote = new Note({
      userId: req.user?._id,
      encryptedContent: encryptedContent ?? "",
      schemaVersion: ENCRYPTION_CONFIG.schemaVersion,
    });

    await newNote.save();

    res.status(201).json({
      success: true,
      message: "Note created successfully",
      note: newNote,
    });
  },
);

export const updateNote = asyncHandler(
  async (
    req: Request<
      ParamsDictionary & UpdateNoteParams,
      NoteResponse,
      UpdateNoteRequest
    >,
    res: Response<NoteResponse>,
  ): Promise<void> => {
    const { encryptedContent } = req.body ?? {};
    const noteId = req.params.id;

    if (!req.user?._id) {
      throw new Error("User not authenticated");
    }

    const updatedFields: any = {};
    if (encryptedContent !== undefined)
      updatedFields.encryptedContent = encryptedContent;

    const noteToUpdate = await Note.findOneAndUpdate(
      { _id: noteId, userId: req.user._id },
      { $set: updatedFields },
      { new: true },
    );

    if (!noteToUpdate) {
      throw new Error("Note does not exist or unauthorized");
    }

    res.status(200).json({
      success: true,
      message: "Note successfully updated",
      note: noteToUpdate,
    });
  },
);

export const deleteNote = asyncHandler(
  async (
    req: Request<ParamsDictionary & DeleteNoteParams, NoteResponse, {}>,
    res: Response<NoteResponse>,
  ): Promise<void> => {
    const noteId = req.params.id;

    if (!req.user?._id) {
      throw new Error("User not authenticated");
    }

    const noteToDelete = await Note.findOneAndDelete({
      _id: noteId,
      userId: req.user._id,
    });

    if (!noteToDelete) {
      throw new Error("Note not found or unauthorized");
    }

    res.status(200).json({
      success: true,
      message: "Note deleted successfully",
      note: noteToDelete,
    });
  },
);

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
