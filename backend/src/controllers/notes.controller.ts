import asyncHandler from '../utils/asyncHandler';
import { Note } from '../models/note.model';

export const getAllNotes = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const userNotes = await Note.find({ userId });

  res.status(200).json(userNotes);
});

export const getNote = asyncHandler(async (req, res) => {
  const noteId = req.params.id;

  if (!noteId) {
    throw new Error('Note ID is required');
  }

  const note = await Note.findById(noteId);

  if (!note) {
    throw new Error('Note not found');
  }

  res.status(200).json(note);
});

export const createNote = asyncHandler(async (req, res) => {
  const { title, content, tags } = req.body ?? {};

  if (!req.user?._id) {
    throw new Error('User not authenticated');
  }

  const newNote = new Note({
    userId: req.user?._id,
    title: title || 'Untitled document',
    encryptedContent: content ?? '',
    tags: tags ?? [],
  });

  await newNote.save();

  res.status(201).json({
    success: true,
    message: 'Note created successfully',
    note: newNote,
  });
});

export const updateNote = asyncHandler(async (req, res) => {
  const { title, content, tags } = req.body ?? {};
  const noteId = req.params.id;

  if (!req.user?._id) {
    throw new Error('User not authenticated');
  }

  const updatedFields: any = {};
  if (title !== undefined) updatedFields.title = title;
  if (content !== undefined) updatedFields.encryptedContent = content;
  if (tags !== undefined) updatedFields.tags = tags;

  const noteToUpdate = await Note.findOneAndUpdate(
    { _id: noteId, userId: req.user._id },
    updatedFields,
    { new: true }
  );

  if (!noteToUpdate) {
    throw new Error('Note does not exist or unauthorized');
  }

  res.status(200).json({
    success: true,
    message: 'Note successfully updated',
    note: noteToUpdate,
  });
});

// TODO: just to be sure, try signing in with another user and send a del req. Should get an error
export const deleteNote = asyncHandler(async (req, res) => {
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
});
