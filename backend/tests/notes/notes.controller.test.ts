import { Request, Response } from 'express';
import mongoose from 'mongoose';

import { buildRes, buildMockUser } from '../../src/lib/testHelpers';
import {
  getAllNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
} from '../../src/controllers/notes.controller';
import { Note } from '../../src/models/note.model';

jest.mock('../../src/models/note.model');

const mockUserId = new mongoose.Types.ObjectId();

const mockNote = {
  _id: new mongoose.Types.ObjectId(),
  userId: mockUserId,
  encryptedContent: 'encrypted-content',
  schemaVersion: 1,
  save: jest.fn().mockResolvedValue(undefined),
};

// req.user is set by auth middleware upstream
const buildReq = (overrides: Partial<Request> = {}): Partial<Request> => ({
  user: { ...buildMockUser(), _id: mockUserId } as any,
  body: {},
  params: {} as any,
  ...overrides,
});

const flushPromises = () => new Promise(process.nextTick);

describe('Notes Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    res = buildRes();
    next = jest.fn();
  });

  // -------------------------
  // getAllNotes
  // -------------------------
  describe('getAllNotes', () => {
    describe('authorization', () => {
      test('throws when user is not authenticated', async () => {
        req = buildReq({ user: undefined });
        await getAllNotes(req as Request, res as Response, next);
        await flushPromises();

        expect(next.mock.calls[0][0].message).toBe('Unauthorized');
      });
    });

    describe('on success', () => {
      test('returns all notes for the user', async () => {
        (Note.find as jest.Mock).mockResolvedValue([mockNote]);
        req = buildReq();
        await getAllNotes(req as Request, res as Response, next);
        await flushPromises();

        expect(Note.find).toHaveBeenCalledWith({ userId: mockUserId });
        expect(res.status).toHaveBeenCalledWith(200);
        const body = (res.json as jest.Mock).mock.calls[0][0];
        expect(body.success).toBe(true);
        expect(body.note).toEqual([mockNote]);
      });

      test('returns empty array when user has no notes', async () => {
        (Note.find as jest.Mock).mockResolvedValue([]);
        req = buildReq();
        await getAllNotes(req as Request, res as Response, next);
        await flushPromises();

        const body = (res.json as jest.Mock).mock.calls[0][0];
        expect(body.note).toEqual([]);
      });
    });
  });

  // -------------------------
  // getNote
  // -------------------------
  describe('getNote', () => {
    describe('input validation', () => {
      test('throws when note ID is not provided', async () => {
        req = buildReq({ params: { id: undefined } as any });
        await getNote(req as any, res as any, next);
        await flushPromises();

        expect(next.mock.calls[0][0].message).toBe('Note ID is required');
      });
    });

    describe('note lookup', () => {
      test('throws when note is not found', async () => {
        (Note.findOne as jest.Mock).mockResolvedValue(null);
        req = buildReq({ params: { id: 'fake-note-id' } as any });
        await getNote(req as any, res as any, next);
        await flushPromises();

        expect(next.mock.calls[0][0].message).toBe('Note not found');
      });

      test('queries note by id and userId', async () => {
        (Note.findOne as jest.Mock).mockResolvedValue(mockNote);
        req = buildReq({ params: { id: mockNote._id.toString() } as any });
        await getNote(req as any, res as any, next);
        await flushPromises();

        expect(Note.findOne).toHaveBeenCalledWith({
          _id: mockNote._id.toString(),
          userId: mockUserId,
        });
      });
    });

    describe('on success', () => {
      test('returns 200 with the note', async () => {
        (Note.findOne as jest.Mock).mockResolvedValue(mockNote);
        req = buildReq({ params: { id: mockNote._id.toString() } as any });
        await getNote(req as any, res as any, next);
        await flushPromises();

        expect(res.status).toHaveBeenCalledWith(200);
        const body = (res.json as jest.Mock).mock.calls[0][0];
        expect(body.note).toEqual(mockNote);
      });
    });
  });

  // -------------------------
  // createNote
  // -------------------------
  describe('createNote', () => {
    describe('authorization', () => {
      test('throws when user is not authenticated', async () => {
        req = buildReq({ user: undefined, body: { encryptedContent: 'abc' } });
        await createNote(req as Request, res as Response, next);
        await flushPromises();

        expect(next.mock.calls[0][0].message).toBe('User not authenticated');
      });
    });

    describe('on success', () => {
      beforeEach(() => {
        (Note as unknown as jest.Mock).mockImplementation(() => mockNote);
      });

      test('creates note with correct userId and encryptedContent', async () => {
        req = buildReq({ body: { encryptedContent: 'encrypted-data' } });
        await createNote(req as Request, res as Response, next);
        await flushPromises();

        const constructedNote = (Note as unknown as jest.Mock).mock.calls[0][0];
        expect(constructedNote.userId).toEqual(mockUserId);
        expect(constructedNote.encryptedContent).toBe('encrypted-data');
      });

      test('defaults encryptedContent to empty string if not provided', async () => {
        req = buildReq({ body: {} });
        await createNote(req as Request, res as Response, next);
        await flushPromises();

        const constructedNote = (Note as unknown as jest.Mock).mock.calls[0][0];
        expect(constructedNote.encryptedContent).toBe('');
      });

      test('returns 201 on success', async () => {
        req = buildReq({ body: { encryptedContent: 'encrypted-data' } });
        await createNote(req as Request, res as Response, next);
        await flushPromises();

        expect(res.status).toHaveBeenCalledWith(201);
        const body = (res.json as jest.Mock).mock.calls[0][0];
        expect(body.success).toBe(true);
      });

      test('calls save', async () => {
        req = buildReq({ body: { encryptedContent: 'encrypted-data' } });
        await createNote(req as Request, res as Response, next);
        await flushPromises();

        expect(mockNote.save).toHaveBeenCalled();
      });
    });
  });

  // -------------------------
  // updateNote
  // -------------------------
  describe('updateNote', () => {
    describe('authorization', () => {
      test('throws when user is not authenticated', async () => {
        req = buildReq({
          user: undefined,
          params: { id: 'fake-note-id' } as any,
          body: { encryptedContent: 'new-content' },
        });
        await updateNote(req as any, res as any, next);
        await flushPromises();

        expect(next.mock.calls[0][0].message).toBe('User not authenticated');
      });
    });

    describe('note lookup', () => {
      test('throws when note does not exist or belongs to another user', async () => {
        (Note.findOneAndUpdate as jest.Mock).mockResolvedValue(null);
        req = buildReq({
          params: { id: 'fake-note-id' } as any,
          body: { encryptedContent: 'new-content' },
        });
        await updateNote(req as any, res as any, next);
        await flushPromises();

        expect(next.mock.calls[0][0].message).toBe(
          'Note does not exist or unauthorized',
        );
      });
    });

    describe('on success', () => {
      test('updates note with correct fields', async () => {
        (Note.findOneAndUpdate as jest.Mock).mockResolvedValue(mockNote);
        req = buildReq({
          params: { id: mockNote._id.toString() } as any,
          body: { encryptedContent: 'new-encrypted-content' },
        });
        await updateNote(req as any, res as any, next);
        await flushPromises();

        expect(Note.findOneAndUpdate).toHaveBeenCalledWith(
          { _id: mockNote._id.toString(), userId: mockUserId },
          { $set: { encryptedContent: 'new-encrypted-content' } },
          { new: true },
        );
      });

      test('returns 200 on success', async () => {
        (Note.findOneAndUpdate as jest.Mock).mockResolvedValue(mockNote);
        req = buildReq({
          params: { id: mockNote._id.toString() } as any,
          body: { encryptedContent: 'new-encrypted-content' },
        });
        await updateNote(req as any, res as any, next);
        await flushPromises();

        expect(res.status).toHaveBeenCalledWith(200);
        const body = (res.json as jest.Mock).mock.calls[0][0];
        expect(body.success).toBe(true);
      });
    });
  });

  // -------------------------
  // deleteNote
  // -------------------------
  describe('deleteNote', () => {
    describe('authorization', () => {
      test('throws when user is not authenticated', async () => {
        req = buildReq({
          user: undefined,
          params: { id: 'fake-note-id' } as any,
        });
        await deleteNote(req as any, res as any, next);
        await flushPromises();

        expect(next.mock.calls[0][0].message).toBe('User not authenticated');
      });
    });

    describe('note lookup', () => {
      test('throws when note does not exist or belongs to another user', async () => {
        (Note.findOneAndDelete as jest.Mock).mockResolvedValue(null);
        req = buildReq({ params: { id: 'fake-note-id' } as any });
        await deleteNote(req as any, res as any, next);
        await flushPromises();

        expect(next.mock.calls[0][0].message).toBe(
          'Note not found or unauthorized',
        );
      });
    });

    describe('on success', () => {
      test('deletes note by id and userId', async () => {
        (Note.findOneAndDelete as jest.Mock).mockResolvedValue(mockNote);
        req = buildReq({ params: { id: mockNote._id.toString() } as any });
        await deleteNote(req as any, res as any, next);
        await flushPromises();

        expect(Note.findOneAndDelete).toHaveBeenCalledWith({
          _id: mockNote._id.toString(),
          userId: mockUserId,
        });
      });

      test('returns 200 on success', async () => {
        (Note.findOneAndDelete as jest.Mock).mockResolvedValue(mockNote);
        req = buildReq({ params: { id: mockNote._id.toString() } as any });
        await deleteNote(req as any, res as any, next);
        await flushPromises();

        expect(res.status).toHaveBeenCalledWith(200);
        const body = (res.json as jest.Mock).mock.calls[0][0];
        expect(body.success).toBe(true);
      });
    });
  });
});
