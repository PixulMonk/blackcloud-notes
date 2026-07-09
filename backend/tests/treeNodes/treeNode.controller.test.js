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
const treeNode_controller_1 = require("../../src/controllers/treeNode.controller");
const treeNode_model_1 = require("../../src/models/treeNode.model");
const note_model_1 = require("../../src/models/note.model");
const treeHelpers_1 = require("../../src/utils/treeHelpers");
jest.mock('../../src/models/treeNode.model');
jest.mock('../../src/models/note.model');
jest.mock('../../src/utils/treeHelpers');
const mockUserId = new mongoose_1.default.Types.ObjectId();
const mockNodeId = new mongoose_1.default.Types.ObjectId();
const mockTreeNode = {
    _id: mockNodeId,
    userId: mockUserId,
    type: 'folder',
    isDeleted: false,
    isArchived: false,
    parentId: null,
    fileId: null,
    save: jest.fn().mockResolvedValue(undefined),
};
const buildReq = (overrides = {}) => (Object.assign({ user: Object.assign(Object.assign({}, (0, testHelpers_1.buildMockUser)()), { _id: mockUserId }), body: {}, params: { id: mockNodeId.toString() } }, overrides));
const flushPromises = () => new Promise(process.nextTick);
describe('TreeNode Controller', () => {
    let req;
    let res;
    let next;
    beforeEach(() => {
        jest.clearAllMocks();
        res = (0, testHelpers_1.buildRes)();
        next = jest.fn();
        req = buildReq();
        treeNode_model_1.TreeNode.find.mockResolvedValue([mockTreeNode]);
        treeNode_model_1.TreeNode.findOne.mockResolvedValue(mockTreeNode);
        treeNode_model_1.TreeNode.findOneAndUpdate.mockResolvedValue(mockTreeNode);
        treeNode_model_1.TreeNode.findOneAndDelete.mockResolvedValue(mockTreeNode);
        treeNode_model_1.TreeNode.countDocuments.mockResolvedValue(0);
        treeNode_model_1.TreeNode.mockImplementation(() => mockTreeNode);
        note_model_1.Note.mockImplementation(() => ({
            _id: new mongoose_1.default.Types.ObjectId(),
            save: jest.fn().mockResolvedValue(undefined),
        }));
        treeHelpers_1.deleteNodeChildren.mockResolvedValue({ notes: 0, nodes: 0 });
        treeHelpers_1.updateNodeAndChildrenRecursively.mockResolvedValue(undefined);
    });
    // -------------------------
    // getAllTreeNodes
    // -------------------------
    describe('getAllTreeNodes', () => {
        test('throws when user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            req = buildReq({ user: undefined });
            yield (0, treeNode_controller_1.getAllTreeNodes)(req, res, next);
            yield flushPromises();
            expect(next.mock.calls[0][0].message).toBe('Unauthorized');
        }));
        test('returns only non-deleted nodes for the user', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, treeNode_controller_1.getAllTreeNodes)(req, res, next);
            yield flushPromises();
            expect(treeNode_model_1.TreeNode.find).toHaveBeenCalledWith({
                userId: mockUserId,
                isDeleted: false,
            });
            expect(res.status).toHaveBeenCalledWith(200);
        }));
    });
    // -------------------------
    // getAllDeleted
    // -------------------------
    describe('getAllDeleted', () => {
        test('throws when user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            req = buildReq({ user: undefined });
            yield (0, treeNode_controller_1.getAllDeleted)(req, res, next);
            yield flushPromises();
            expect(next.mock.calls[0][0].message).toBe('Unauthorized');
        }));
        test('returns only deleted nodes for the user', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, treeNode_controller_1.getAllDeleted)(req, res, next);
            yield flushPromises();
            expect(treeNode_model_1.TreeNode.find).toHaveBeenCalledWith({
                userId: mockUserId,
                isDeleted: true,
            });
        }));
    });
    // -------------------------
    // getAllArchived
    // -------------------------
    describe('getAllArchived', () => {
        test('throws when user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            req = buildReq({ user: undefined });
            yield (0, treeNode_controller_1.getAllArchived)(req, res, next);
            yield flushPromises();
            expect(next.mock.calls[0][0].message).toBe('Unauthorized');
        }));
        test('returns only archived nodes for the user', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, treeNode_controller_1.getAllArchived)(req, res, next);
            yield flushPromises();
            expect(treeNode_model_1.TreeNode.find).toHaveBeenCalledWith({
                userId: mockUserId,
                isArchived: true,
            });
        }));
    });
    // -------------------------
    // createTreeNode
    // -------------------------
    describe('createTreeNode', () => {
        describe('authorization', () => {
            test('throws when user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
                req = buildReq({ user: undefined, body: { type: 'folder' } });
                yield (0, treeNode_controller_1.createTreeNode)(req, res, next);
                yield flushPromises();
                expect(next.mock.calls[0][0].message).toBe('User not authenticated');
            }));
        });
        describe('file type', () => {
            test('creates a Note when type is file', () => __awaiter(void 0, void 0, void 0, function* () {
                req = buildReq({ body: { type: 'file' } });
                yield (0, treeNode_controller_1.createTreeNode)(req, res, next);
                yield flushPromises();
                expect(note_model_1.Note).toHaveBeenCalled();
            }));
            test('does not create a Note when type is folder', () => __awaiter(void 0, void 0, void 0, function* () {
                req = buildReq({ body: { type: 'folder' } });
                yield (0, treeNode_controller_1.createTreeNode)(req, res, next);
                yield flushPromises();
                expect(note_model_1.Note).not.toHaveBeenCalled();
            }));
        });
        describe('on success', () => {
            test('returns 201 on success', () => __awaiter(void 0, void 0, void 0, function* () {
                req = buildReq({ body: { type: 'folder' } });
                yield (0, treeNode_controller_1.createTreeNode)(req, res, next);
                yield flushPromises();
                expect(res.status).toHaveBeenCalledWith(201);
                const body = res.json.mock.calls[0][0];
                expect(body.success).toBe(true);
            }));
        });
    });
    // -------------------------
    // updateTreeNode
    // -------------------------
    describe('updateTreeNode', () => {
        describe('authorization', () => {
            test('throws when user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
                req = buildReq({ user: undefined });
                yield (0, treeNode_controller_1.updateTreeNode)(req, res, next);
                yield flushPromises();
                expect(next.mock.calls[0][0].message).toBe('User not authenticated');
            }));
        });
        describe('input validation', () => {
            test('returns 400 for invalid node ID', () => __awaiter(void 0, void 0, void 0, function* () {
                req = buildReq({ params: { id: 'not-a-valid-id' } });
                yield (0, treeNode_controller_1.updateTreeNode)(req, res, next);
                yield flushPromises();
                expect(res.status).toHaveBeenCalledWith(400);
                const body = res.json.mock.calls[0][0];
                expect(body.message).toBe('Invalid tree node ID');
            }));
            test('returns 400 when encryptedTitle is too short', () => __awaiter(void 0, void 0, void 0, function* () {
                req = buildReq({ body: { encryptedTitle: 'short' } });
                yield (0, treeNode_controller_1.updateTreeNode)(req, res, next);
                yield flushPromises();
                expect(res.status).toHaveBeenCalledWith(400);
                const body = res.json.mock.calls[0][0];
                expect(body.message).toBe('Encrypted title blob is too short or corrupted');
            }));
            test('returns 400 when node is already deleted', () => __awaiter(void 0, void 0, void 0, function* () {
                treeNode_model_1.TreeNode.findOne.mockResolvedValue(Object.assign(Object.assign({}, mockTreeNode), { isDeleted: true }));
                yield (0, treeNode_controller_1.updateTreeNode)(req, res, next);
                yield flushPromises();
                expect(res.status).toHaveBeenCalledWith(400);
                const body = res.json.mock.calls[0][0];
                expect(body.message).toBe('Cannot update a deleted node');
            }));
            test('returns 400 when node is set as its own parent', () => __awaiter(void 0, void 0, void 0, function* () {
                req = buildReq({ body: { parentId: mockNodeId.toString() } });
                yield (0, treeNode_controller_1.updateTreeNode)(req, res, next);
                yield flushPromises();
                expect(res.status).toHaveBeenCalledWith(400);
                const body = res.json.mock.calls[0][0];
                expect(body.message).toBe('A node cannot be its own parent');
            }));
            test('returns 400 when node is both deleted and archived', () => __awaiter(void 0, void 0, void 0, function* () {
                req = buildReq({ body: { isDeleted: true, isArchived: true } });
                yield (0, treeNode_controller_1.updateTreeNode)(req, res, next);
                yield flushPromises();
                expect(res.status).toHaveBeenCalledWith(400);
                const body = res.json.mock.calls[0][0];
                expect(body.message).toBe('Node cannot be both deleted and archived');
            }));
            test('returns 400 when changing node type', () => __awaiter(void 0, void 0, void 0, function* () {
                req = buildReq({ body: { type: 'file' } }); // mock node is 'folder'
                yield (0, treeNode_controller_1.updateTreeNode)(req, res, next);
                yield flushPromises();
                expect(res.status).toHaveBeenCalledWith(400);
                const body = res.json.mock.calls[0][0];
                expect(body.message).toBe('Changing node type is not allowed');
            }));
            test('returns 400 when assigning fileId to a folder', () => __awaiter(void 0, void 0, void 0, function* () {
                req = buildReq({
                    body: { fileId: new mongoose_1.default.Types.ObjectId().toString() },
                });
                yield (0, treeNode_controller_1.updateTreeNode)(req, res, next);
                yield flushPromises();
                expect(res.status).toHaveBeenCalledWith(400);
                const body = res.json.mock.calls[0][0];
                expect(body.message).toBe('Cannot assign a fileId to a folder node');
            }));
        });
        describe('node lookup', () => {
            test('throws when node does not exist or belongs to another user', () => __awaiter(void 0, void 0, void 0, function* () {
                treeNode_model_1.TreeNode.findOne.mockResolvedValue(null);
                yield (0, treeNode_controller_1.updateTreeNode)(req, res, next);
                yield flushPromises();
                expect(next.mock.calls[0][0].message).toBe('Tree node does not exist or unauthorized');
            }));
        });
        describe('on success', () => {
            test('returns 200 on success', () => __awaiter(void 0, void 0, void 0, function* () {
                yield (0, treeNode_controller_1.updateTreeNode)(req, res, next);
                yield flushPromises();
                expect(res.status).toHaveBeenCalledWith(200);
                const body = res.json.mock.calls[0][0];
                expect(body.success).toBe(true);
            }));
        });
    });
    // -------------------------
    // deleteTreeNode
    // -------------------------
    describe('deleteTreeNode', () => {
        describe('authorization', () => {
            test('throws when user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
                req = buildReq({ user: undefined });
                yield (0, treeNode_controller_1.deleteTreeNode)(req, res, next);
                yield flushPromises();
                expect(next.mock.calls[0][0].message).toBe('User not authenticated');
            }));
        });
        describe('node lookup', () => {
            test('throws when node does not exist or belongs to another user', () => __awaiter(void 0, void 0, void 0, function* () {
                treeNode_model_1.TreeNode.findOne.mockResolvedValue(null);
                yield (0, treeNode_controller_1.deleteTreeNode)(req, res, next);
                yield flushPromises();
                expect(next.mock.calls[0][0].message).toBe('Tree node not found or unauthorized');
            }));
        });
        describe('file deletion', () => {
            test('deletes associated note when type is file', () => __awaiter(void 0, void 0, void 0, function* () {
                treeNode_model_1.TreeNode.findOne.mockResolvedValue(Object.assign(Object.assign({}, mockTreeNode), { type: 'file', fileId: new mongoose_1.default.Types.ObjectId() }));
                note_model_1.Note.findOneAndDelete.mockResolvedValue({
                    _id: 'note-id',
                });
                yield (0, treeNode_controller_1.deleteTreeNode)(req, res, next);
                yield flushPromises();
                expect(note_model_1.Note.findOneAndDelete).toHaveBeenCalled();
            }));
            test('deletes children recursively when type is folder', () => __awaiter(void 0, void 0, void 0, function* () {
                yield (0, treeNode_controller_1.deleteTreeNode)(req, res, next);
                yield flushPromises();
                expect(treeHelpers_1.deleteNodeChildren).toHaveBeenCalledWith(mockNodeId.toString(), mockUserId.toString());
            }));
        });
        describe('on success', () => {
            test('returns 200 on success', () => __awaiter(void 0, void 0, void 0, function* () {
                yield (0, treeNode_controller_1.deleteTreeNode)(req, res, next);
                yield flushPromises();
                expect(res.status).toHaveBeenCalledWith(200);
                const body = res.json.mock.calls[0][0];
                expect(body.success).toBe(true);
            }));
            test('includes deletion statistics in response', () => __awaiter(void 0, void 0, void 0, function* () {
                yield (0, treeNode_controller_1.deleteTreeNode)(req, res, next);
                yield flushPromises();
                const body = res.json.mock.calls[0][0];
                expect(body.statistics).toHaveProperty('deletedNodes');
                expect(body.statistics).toHaveProperty('deletedNotes');
            }));
        });
    });
    // -------------------------
    // softDeleteTreeNode
    // -------------------------
    describe('softDeleteTreeNode', () => {
        test('throws when user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            req = buildReq({ user: undefined });
            yield (0, treeNode_controller_1.softDeleteTreeNode)(req, res, next);
            yield flushPromises();
            expect(next.mock.calls[0][0].message).toBe('User not authenticated');
        }));
        test('throws when node does not exist or unauthorized', () => __awaiter(void 0, void 0, void 0, function* () {
            treeNode_model_1.TreeNode.findOne.mockResolvedValue(null);
            yield (0, treeNode_controller_1.softDeleteTreeNode)(req, res, next);
            yield flushPromises();
            expect(next.mock.calls[0][0].message).toBe('Tree node does not exist or unauthorized');
        }));
        test('throws when node is already deleted', () => __awaiter(void 0, void 0, void 0, function* () {
            treeNode_model_1.TreeNode.findOne.mockResolvedValue(Object.assign(Object.assign({}, mockTreeNode), { isDeleted: true }));
            yield (0, treeNode_controller_1.softDeleteTreeNode)(req, res, next);
            yield flushPromises();
            expect(next.mock.calls[0][0].message).toBe('Node already deleted');
        }));
        test('calls updateNodeAndChildrenRecursively with isDeleted true', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, treeNode_controller_1.softDeleteTreeNode)(req, res, next);
            yield flushPromises();
            expect(treeHelpers_1.updateNodeAndChildrenRecursively).toHaveBeenCalledWith(mockNodeId.toString(), mockUserId.toString(), expect.objectContaining({ isDeleted: true }));
        }));
        test('returns 200 on success', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, treeNode_controller_1.softDeleteTreeNode)(req, res, next);
            yield flushPromises();
            expect(res.status).toHaveBeenCalledWith(200);
        }));
    });
    // -------------------------
    // archiveTreeNode
    // -------------------------
    describe('archiveTreeNode', () => {
        test('throws when user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            req = buildReq({ user: undefined });
            yield (0, treeNode_controller_1.archiveTreeNode)(req, res, next);
            yield flushPromises();
            expect(next.mock.calls[0][0].message).toBe('User not authenticated');
        }));
        test('throws when node does not exist or unauthorized', () => __awaiter(void 0, void 0, void 0, function* () {
            treeNode_model_1.TreeNode.findOne.mockResolvedValue(null);
            yield (0, treeNode_controller_1.archiveTreeNode)(req, res, next);
            yield flushPromises();
            expect(next.mock.calls[0][0].message).toBe('Tree node does not exist or unauthorized');
        }));
        test('throws when node is already archived', () => __awaiter(void 0, void 0, void 0, function* () {
            treeNode_model_1.TreeNode.findOne.mockResolvedValue(Object.assign(Object.assign({}, mockTreeNode), { isArchived: true }));
            yield (0, treeNode_controller_1.archiveTreeNode)(req, res, next);
            yield flushPromises();
            expect(next.mock.calls[0][0].message).toBe('Node already archived');
        }));
        test('throws when trying to archive a deleted node', () => __awaiter(void 0, void 0, void 0, function* () {
            treeNode_model_1.TreeNode.findOne.mockResolvedValue(Object.assign(Object.assign({}, mockTreeNode), { isDeleted: true }));
            yield (0, treeNode_controller_1.archiveTreeNode)(req, res, next);
            yield flushPromises();
            expect(next.mock.calls[0][0].message).toBe('Cannot archive a deleted node');
        }));
        test('calls updateNodeAndChildrenRecursively with isArchived true', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, treeNode_controller_1.archiveTreeNode)(req, res, next);
            yield flushPromises();
            expect(treeHelpers_1.updateNodeAndChildrenRecursively).toHaveBeenCalledWith(mockNodeId.toString(), mockUserId.toString(), expect.objectContaining({ isArchived: true }));
        }));
        test('returns 200 on success', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, treeNode_controller_1.archiveTreeNode)(req, res, next);
            yield flushPromises();
            expect(res.status).toHaveBeenCalledWith(200);
        }));
    });
});
