import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

import { ENCRYPTION_CONFIG } from '@blackcloud/shared';
import asyncHandler from '../utils/asyncHandler';
import { Note, type INote } from '../models/note.model';
import {
  CreateNoteRequest,
  DeleteNoteParams,
  GetAllNotesRequest,
  GetNoteParams,
  NoteResponse,
  UpdateNoteParams,
  UpdateNoteRequest,
} from '../types/notes.types';

export const getAllNotes = asyncHandler(
  async (req: GetAllNotesRequest, res: Response<INote[]>): Promise<void> => {
    const userId = req.user?._id;

    if (!userId) {
      throw new Error('Unauthorized');
    }

    const userNotes = await Note.find({ userId });

    res.status(200).json(userNotes);
  },
);

export const getNote = asyncHandler(
  async (
    req: Request<ParamsDictionary & GetNoteParams, NoteResponse, {}>,
    res: Response<NoteResponse>,
  ): Promise<void> => {
    const noteId = req.params.id;

    if (!noteId) {
      throw new Error('Note ID is required');
    }

    const note = await Note.findOne({ _id: noteId, userId: req.user?._id });

    if (!note) {
      throw new Error('Note not found');
    }

    res.status(200).json({
      success: true,
      message: 'Note retrieved successfully',
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
      throw new Error('User not authenticated');
    }

    const newNote = new Note({
      userId: req.user?._id,
      encryptedContent: encryptedContent ?? '',
      schemaVersion: ENCRYPTION_CONFIG.schemaVersion,
    });

    await newNote.save();

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
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
      throw new Error('User not authenticated');
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
      throw new Error('Note does not exist or unauthorized');
    }

    res.status(200).json({
      success: true,
      message: 'Note successfully updated',
      note: noteToUpdate,
    });
  },
);

// TODO: just to be sure, try signing in with another user and send a del req. Should get an error
export const deleteNote = asyncHandler(
  async (
    req: Request<ParamsDictionary & DeleteNoteParams, NoteResponse, {}>,
    res: Response<NoteResponse>,
  ): Promise<void> => {
    const noteId = req.params.id;

    if (!req.user?._id) {
      throw new Error('User not authenticated');
    }

    const noteToDelete = await Note.findOneAndDelete({
      _id: noteId,
      userId: req.user._id,
    });

    if (!noteToDelete) {
      throw new Error('Note not found or unauthorized');
    }

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully',
      note: noteToDelete,
    });
  },
);
