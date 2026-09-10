"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const testHelpers_1 = require("../../src/lib/testHelpers");
const notes_controller_1 = require("../../src/controllers/notes.controller");
const note_model_1 = require("../../src/models/note.model");
jest.mock('../../src/models/note.model');
const mockUserId = new mongoose_1.default.Types.ObjectId();
const mockNote = {
    _id: new mongoose_1.default.Types.ObjectId(),
    userId: mockUserId,
    encryptedContent: 'encrypted-content',
    schemaVersion: 1,
    save: jest.fn().mockResolvedValue(undefined),
};
// req.user is set by auth middleware upstream
const buildReq = (overrides = {}) => (Object.assign({ user: Object.assign(Object.assign({}, (0, testHelpers_1.buildMockUser)()), { _id: mockUserId }), body: {}, params: {} }, overrides));
const flushPromises = () => new Promise(process.nextTick);
describe('Notes Controller', () => {
    let req;
    let res;
    let next;
    beforeEach(() => {
        jest.clearAllMocks();
        res = (0, testHelpers_1.buildRes)();
        next = jest.fn();
    });
    // -------------------------
    // getAllNotes
    // -------------------------
    describe('getAllNotes', () => {
        describe('authorization', () => {
            test('throws when user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
                req = buildReq({ user: undefined });
                yield (0, notes_controller_1.getAllNotes)(req, res, next);
                yield flushPromises();
                expect(next.mock.calls[0][0].message).toBe('Unauthorized');
            }));
        });
        describe('on success', () => {
            test('returns all notes for the user', () => __awaiter(void 0, void 0, void 0, function* () {
                note_model_1.Note.find.mockResolvedValue([mockNote]);
                req = buildReq();
                yield (0, notes_controller_1.getAllNotes)(req, res, next);
                yield flushPromises();
                expect(note_model_1.Note.find).toHaveBeenCalledWith({ userId: mockUserId });
                expect(res.status).toHaveBeenCalledWith(200);
                const body = res.json.mock.calls[0][0];
                expect(body.success).toBe(true);
                expect(body.note).toEqual([mockNote]);
            }));
            test('returns empty array when user has no notes', () => __awaiter(void 0, void 0, void 0, function* () {
                note_model_1.Note.find.mockResolvedValue([]);
                req = buildReq();
                yield (0, notes_controller_1.getAllNotes)(req, res, next);
                yield flushPromises();
                const body = res.json.mock.calls[0][0];
                expect(body.note).toEqual([]);
            }));
        });
    });
    // -------------------------
    // getNote
    // -------------------------
    describe('getNote', () => {
        describe('input validation', () => {
            test('throws when note ID is not provided', () => __awaiter(void 0, void 0, void 0, function* () {
                req = buildReq({ params: { id: undefined } });
                yield (0, notes_controller_1.getNote)(req, res, next);
                yield flushPromises();
                expect(next.mock.calls[0][0].message).toBe('Note ID is required');
            }));
        });
        describe('note lookup', () => {
            test('throws when note is not found', () => __awaiter(void 0, void 0, void 0, function* () {
                note_model_1.Note.findOne.mockResolvedValue(null);
                req = buildReq({ params: { id: 'fake-note-id' } });
                yield (0, notes_controller_1.getNote)(req, res, next);
                yield flushPromises();
                expect(next.mock.calls[0][0].message).toBe('Note not found');
            }));
            test('queries note by id and userId', () => __awaiter(void 0, void 0, void 0, function* () {
                note_model_1.Note.findOne.mockResolvedValue(mockNote);
                req = buildReq({ params: { id: mockNote._id.toString() } });
                yield (0, notes_controller_1.getNote)(req, res, next);
                yield flushPromises();
                expect(note_model_1.Note.findOne).toHaveBeenCalledWith({
                    _id: mockNote._id.toString(),
                    userId: mockUserId,
                });
            }));
        });
        describe('on success', () => {
            test('returns 200 with the note', () => __awaiter(void 0, void 0, void 0, function* () {
                note_model_1.Note.findOne.mockResolvedValue(mockNote);
                req = buildReq({ params: { id: mockNote._id.toString() } });
                yield (0, notes_controller_1.getNote)(req, res, next);
                yield flushPromises();
                expect(res.status).toHaveBeenCalledWith(200);
                const body = res.json.mock.calls[0][0];
                expect(body.note).toEqual(mockNote);
            }));
        });
    });
    // -------------------------
    // createNote
    // -------------------------
    describe('createNote', () => {
        describe('authorization', () => {
            test('throws when user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
                req = buildReq({ user: undefined, body: { encryptedContent: 'abc' } });
                yield (0, notes_controller_1.createNote)(req, res, next);
                yield flushPromises();
                expect(next.mock.calls[0][0].message).toBe('User not authenticated');
            }));
        });
        describe('on success', () => {
            beforeEach(() => {
                note_model_1.Note.mockImplementation(() => mockNote);
            });
            test('creates note with correct userId and encryptedContent', () => __awaiter(void 0, void 0, void 0, function* () {
                req = buildReq({ body: { encryptedContent: 'encrypted-data' } });
                yield (0, notes_controller_1.createNote)(req, res, next);
                yield flushPromises();
                const constructedNote = note_model_1.Note.mock.calls[0][0];
                expect(constructedNote.userId).toEqual(mockUserId);
                expect(constructedNote.encryptedContent).toBe('encrypted-data');
            }));
            test('defaults encryptedContent to empty string if not provided', () => __awaiter(void 0, void 0, void 0, function* () {
                req = buildReq({ body: {} });
                yield (0, notes_controller_1.createNote)(req, res, next);
                yield flushPromises();
                const constructedNote = note_model_1.Note.mock.calls[0][0];
                expect(constructedNote.encryptedContent).toBe('');
            }));
            test('returns 201 on success', () => __awaiter(void 0, void 0, void 0, function* () {
                req = buildReq({ body: { encryptedContent: 'encrypted-data' } });
                yield (0, notes_controller_1.createNote)(req, res, next);
                yield flushPromises();
                expect(res.status).toHaveBeenCalledWith(201);
                const body = res.json.mock.calls[0][0];
                expect(body.success).toBe(true);
            }));
            test('calls save', () => __awaiter(void 0, void 0, void 0, function* () {
                req = buildReq({ body: { encryptedContent: 'encrypted-data' } });
                yield (0, notes_controller_1.createNote)(req, res, next);
                yield flushPromises();
                expect(mockNote.save).toHaveBeenCalled();
            }));
        });
    });
    // -------------------------
    // updateNote
    // -------------------------
    describe('updateNote', () => {
        describe('authorization', () => {
            test('throws when user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
                req = buildReq({
                    user: undefined,
                    params: { id: 'fake-note-id' },
                    body: { encryptedContent: 'new-content' },
                });
                yield (0, notes_controller_1.updateNote)(req, res, next);
                yield flushPromises();
                expect(next.mock.calls[0][0].message).toBe('User not authenticated');
            }));
        });
        describe('note lookup', () => {
            test('throws when note does not exist or belongs to another user', () => __awaiter(void 0, void 0, void 0, function* () {
                note_model_1.Note.findOneAndUpdate.mockResolvedValue(null);
                req = buildReq({
                    params: { id: 'fake-note-id' },
                    body: { encryptedContent: 'new-content' },
                });
                yield (0, notes_controller_1.updateNote)(req, res, next);
                yield flushPromises();
                expect(next.mock.calls[0][0].message).toBe('Note does not exist or unauthorized');
            }));
        });
        describe('on success', () => {
            test('updates note with correct fields', () => __awaiter(void 0, void 0, void 0, function* () {
                note_model_1.Note.findOneAndUpdate.mockResolvedValue(mockNote);
                req = buildReq({
                    params: { id: mockNote._id.toString() },
                    body: { encryptedContent: 'new-encrypted-content' },
                });
                yield (0, notes_controller_1.updateNote)(req, res, next);
                yield flushPromises();
                expect(note_model_1.Note.findOneAndUpdate).toHaveBeenCalledWith({ _id: mockNote._id.toString(), userId: mockUserId }, { $set: { encryptedContent: 'new-encrypted-content' } }, { new: true });
            }));
            test('returns 200 on success', () => __awaiter(void 0, void 0, void 0, function* () {
                note_model_1.Note.findOneAndUpdate.mockResolvedValue(mockNote);
                req = buildReq({
                    params: { id: mockNote._id.toString() },
                    body: { encryptedContent: 'new-encrypted-content' },
                });
                yield (0, notes_controller_1.updateNote)(req, res, next);
                yield flushPromises();
                expect(res.status).toHaveBeenCalledWith(200);
                const body = res.json.mock.calls[0][0];
                expect(body.success).toBe(true);
            }));
        });
    });
    // -------------------------
    // deleteNote
    // -------------------------
    describe('deleteNote', () => {
        describe('authorization', () => {
            test('throws when user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
                req = buildReq({
                    user: undefined,
                    params: { id: 'fake-note-id' },
                });
                yield (0, notes_controller_1.deleteNote)(req, res, next);
                yield flushPromises();
                expect(next.mock.calls[0][0].message).toBe('User not authenticated');
            }));
        });
        describe('note lookup', () => {
            test('throws when note does not exist or belongs to another user', () => __awaiter(void 0, void 0, void 0, function* () {
                note_model_1.Note.findOneAndDelete.mockResolvedValue(null);
                req = buildReq({ params: { id: 'fake-note-id' } });
                yield (0, notes_controller_1.deleteNote)(req, res, next);
                yield flushPromises();
                expect(next.mock.calls[0][0].message).toBe('Note not found or unauthorized');
            }));
        });
        describe('on success', () => {
            test('deletes note by id and userId', () => __awaiter(void 0, void 0, void 0, function* () {
                note_model_1.Note.findOneAndDelete.mockResolvedValue(mockNote);
                req = buildReq({ params: { id: mockNote._id.toString() } });
                yield (0, notes_controller_1.deleteNote)(req, res, next);
                yield flushPromises();
                expect(note_model_1.Note.findOneAndDelete).toHaveBeenCalledWith({
                    _id: mockNote._id.toString(),
                    userId: mockUserId,
                });
            }));
            test('returns 200 on success', () => __awaiter(void 0, void 0, void 0, function* () {
                note_model_1.Note.findOneAndDelete.mockResolvedValue(mockNote);
                req = buildReq({ params: { id: mockNote._id.toString() } });
                yield (0, notes_controller_1.deleteNote)(req, res, next);
                yield flushPromises();
                expect(res.status).toHaveBeenCalledWith(200);
                const body = res.json.mock.calls[0][0];
                expect(body.success).toBe(true);
            }));
        });
    });
});
