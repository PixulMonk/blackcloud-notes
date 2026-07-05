import { Request, Response } from 'express';
import mongoose from 'mongoose';

import { buildRes, buildMockUser } from '../../src/lib/testHelpers';
import {
  getAllTreeNodes,
  getAllDeleted,
  getAllArchived,
  createTreeNode,
  updateTreeNode,
  deleteTreeNode,
  softDeleteTreeNode,
  archiveTreeNode,
} from '../../src/controllers/treeNode.controller';
import { TreeNode } from '../../src/models/treeNode.model';
import { Note } from '../../src/models/note.model';
import {
  deleteNodeChildren,
  updateNodeAndChildrenRecursively,
} from '../../src/utils/treeHelpers';

jest.mock('../../src/models/treeNode.model');
jest.mock('../../src/models/note.model');
jest.mock('../../src/utils/treeHelpers');

const mockUserId = new mongoose.Types.ObjectId();
const mockNodeId = new mongoose.Types.ObjectId();

const mockTreeNode: any = {
  _id: mockNodeId,
  userId: mockUserId,
  type: 'folder',
  isDeleted: false,
  isArchived: false,
  parentId: null,
  fileId: null,
  save: jest.fn().mockResolvedValue(undefined),
};

const buildReq = (overrides: Partial<Request> = {}): Partial<Request> => ({
  user: { ...buildMockUser(), _id: mockUserId } as any,
  body: {},
  params: { id: mockNodeId.toString() } as any,
  ...overrides,
});

const flushPromises = () => new Promise(process.nextTick);

describe('TreeNode Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    res = buildRes();
    next = jest.fn();
    req = buildReq();

    (TreeNode.find as jest.Mock).mockResolvedValue([mockTreeNode]);
    (TreeNode.findOne as jest.Mock).mockResolvedValue(mockTreeNode);
    (TreeNode.findOneAndUpdate as jest.Mock).mockResolvedValue(mockTreeNode);
    (TreeNode.findOneAndDelete as jest.Mock).mockResolvedValue(mockTreeNode);
    (TreeNode.countDocuments as jest.Mock).mockResolvedValue(0);
    (TreeNode as unknown as jest.Mock).mockImplementation(() => mockTreeNode);
    (Note as unknown as jest.Mock).mockImplementation(() => ({
      _id: new mongoose.Types.ObjectId(),
      save: jest.fn().mockResolvedValue(undefined),
    }));
    (deleteNodeChildren as jest.Mock).mockResolvedValue({ notes: 0, nodes: 0 });
    (updateNodeAndChildrenRecursively as jest.Mock).mockResolvedValue(
      undefined,
    );
  });

  // -------------------------
  // getAllTreeNodes
  // -------------------------
  describe('getAllTreeNodes', () => {
    test('throws when user is not authenticated', async () => {
      req = buildReq({ user: undefined });
      await getAllTreeNodes(req as Request, res as Response, next);
      await flushPromises();

      expect(next.mock.calls[0][0].message).toBe('Unauthorized');
    });

    test('returns only non-deleted nodes for the user', async () => {
      await getAllTreeNodes(req as Request, res as Response, next);
      await flushPromises();

      expect(TreeNode.find).toHaveBeenCalledWith({
        userId: mockUserId,
        isDeleted: false,
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  // -------------------------
  // getAllDeleted
  // -------------------------
  describe('getAllDeleted', () => {
    test('throws when user is not authenticated', async () => {
      req = buildReq({ user: undefined });
      await getAllDeleted(req as Request, res as Response, next);
      await flushPromises();

      expect(next.mock.calls[0][0].message).toBe('Unauthorized');
    });

    test('returns only deleted nodes for the user', async () => {
      await getAllDeleted(req as Request, res as Response, next);
      await flushPromises();

      expect(TreeNode.find).toHaveBeenCalledWith({
        userId: mockUserId,
        isDeleted: true,
      });
    });
  });

  // -------------------------
  // getAllArchived
  // -------------------------
  describe('getAllArchived', () => {
    test('throws when user is not authenticated', async () => {
      req = buildReq({ user: undefined });
      await getAllArchived(req as Request, res as Response, next);
      await flushPromises();

      expect(next.mock.calls[0][0].message).toBe('Unauthorized');
    });

    test('returns only archived nodes for the user', async () => {
      await getAllArchived(req as Request, res as Response, next);
      await flushPromises();

      expect(TreeNode.find).toHaveBeenCalledWith({
        userId: mockUserId,
        isArchived: true,
      });
    });
  });

  // -------------------------
  // createTreeNode
  // -------------------------
  describe('createTreeNode', () => {
    describe('authorization', () => {
      test('throws when user is not authenticated', async () => {
        req = buildReq({ user: undefined, body: { type: 'folder' } });
        await createTreeNode(req as Request, res as Response, next);
        await flushPromises();

        expect(next.mock.calls[0][0].message).toBe('User not authenticated');
      });
    });

    describe('file type', () => {
      test('creates a Note when type is file', async () => {
        req = buildReq({ body: { type: 'file' } });
        await createTreeNode(req as Request, res as Response, next);
        await flushPromises();

        expect(Note).toHaveBeenCalled();
      });

      test('does not create a Note when type is folder', async () => {
        req = buildReq({ body: { type: 'folder' } });
        await createTreeNode(req as Request, res as Response, next);
        await flushPromises();

        expect(Note).not.toHaveBeenCalled();
      });
    });

    describe('on success', () => {
      test('returns 201 on success', async () => {
        req = buildReq({ body: { type: 'folder' } });
        await createTreeNode(req as Request, res as Response, next);
        await flushPromises();

        expect(res.status).toHaveBeenCalledWith(201);
        const body = (res.json as jest.Mock).mock.calls[0][0];
        expect(body.success).toBe(true);
      });
    });
  });

  // -------------------------
  // updateTreeNode
  // -------------------------
  describe('updateTreeNode', () => {
    describe('authorization', () => {
      test('throws when user is not authenticated', async () => {
        req = buildReq({ user: undefined });
        await updateTreeNode(req as any, res as any, next);
        await flushPromises();

        expect(next.mock.calls[0][0].message).toBe('User not authenticated');
      });
    });

    describe('input validation', () => {
      test('returns 400 for invalid node ID', async () => {
        req = buildReq({ params: { id: 'not-a-valid-id' } as any });
        await updateTreeNode(req as any, res as any, next);
        await flushPromises();

        expect(res.status).toHaveBeenCalledWith(400);
        const body = (res.json as jest.Mock).mock.calls[0][0];
        expect(body.message).toBe('Invalid tree node ID');
      });

      test('returns 400 when encryptedTitle is too short', async () => {
        req = buildReq({ body: { encryptedTitle: 'short' } });
        await updateTreeNode(req as any, res as any, next);
        await flushPromises();

        expect(res.status).toHaveBeenCalledWith(400);
        const body = (res.json as jest.Mock).mock.calls[0][0];
        expect(body.message).toBe(
          'Encrypted title blob is too short or corrupted',
        );
      });

      test('returns 400 when node is already deleted', async () => {
        (TreeNode.findOne as jest.Mock).mockResolvedValue({
          ...mockTreeNode,
          isDeleted: true,
        });
        await updateTreeNode(req as any, res as any, next);
        await flushPromises();

        expect(res.status).toHaveBeenCalledWith(400);
        const body = (res.json as jest.Mock).mock.calls[0][0];
        expect(body.message).toBe('Cannot update a deleted node');
      });

      test('returns 400 when node is set as its own parent', async () => {
        req = buildReq({ body: { parentId: mockNodeId.toString() } });
        await updateTreeNode(req as any, res as any, next);
        await flushPromises();

        expect(res.status).toHaveBeenCalledWith(400);
        const body = (res.json as jest.Mock).mock.calls[0][0];
        expect(body.message).toBe('A node cannot be its own parent');
      });

      test('returns 400 when node is both deleted and archived', async () => {
        req = buildReq({ body: { isDeleted: true, isArchived: true } });
        await updateTreeNode(req as any, res as any, next);
        await flushPromises();

        expect(res.status).toHaveBeenCalledWith(400);
        const body = (res.json as jest.Mock).mock.calls[0][0];
        expect(body.message).toBe('Node cannot be both deleted and archived');
      });

      test('returns 400 when changing node type', async () => {
        req = buildReq({ body: { type: 'file' } }); // mock node is 'folder'
        await updateTreeNode(req as any, res as any, next);
        await flushPromises();

        expect(res.status).toHaveBeenCalledWith(400);
        const body = (res.json as jest.Mock).mock.calls[0][0];
        expect(body.message).toBe('Changing node type is not allowed');
      });

      test('returns 400 when assigning fileId to a folder', async () => {
        req = buildReq({
          body: { fileId: new mongoose.Types.ObjectId().toString() },
        });
        await updateTreeNode(req as any, res as any, next);
        await flushPromises();

        expect(res.status).toHaveBeenCalledWith(400);
        const body = (res.json as jest.Mock).mock.calls[0][0];
        expect(body.message).toBe('Cannot assign a fileId to a folder node');
      });
    });

    describe('node lookup', () => {
      test('throws when node does not exist or belongs to another user', async () => {
        (TreeNode.findOne as jest.Mock).mockResolvedValue(null);
        await updateTreeNode(req as any, res as any, next);
        await flushPromises();

        expect(next.mock.calls[0][0].message).toBe(
          'Tree node does not exist or unauthorized',
        );
      });
    });

    describe('on success', () => {
      test('returns 200 on success', async () => {
        await updateTreeNode(req as any, res as any, next);
        await flushPromises();

        expect(res.status).toHaveBeenCalledWith(200);
        const body = (res.json as jest.Mock).mock.calls[0][0];
        expect(body.success).toBe(true);
      });
    });
  });

  // -------------------------
  // deleteTreeNode
  // -------------------------
  describe('deleteTreeNode', () => {
    describe('authorization', () => {
      test('throws when user is not authenticated', async () => {
        req = buildReq({ user: undefined });
        await deleteTreeNode(req as any, res as any, next);
        await flushPromises();

        expect(next.mock.calls[0][0].message).toBe('User not authenticated');
      });
    });

    describe('node lookup', () => {
      test('throws when node does not exist or belongs to another user', async () => {
        (TreeNode.findOne as jest.Mock).mockResolvedValue(null);
        await deleteTreeNode(req as any, res as any, next);
        await flushPromises();

        expect(next.mock.calls[0][0].message).toBe(
          'Tree node not found or unauthorized',
        );
      });
    });

    describe('file deletion', () => {
      test('deletes associated note when type is file', async () => {
        (TreeNode.findOne as jest.Mock).mockResolvedValue({
          ...mockTreeNode,
          type: 'file',
          fileId: new mongoose.Types.ObjectId(),
        });
        (Note.findOneAndDelete as jest.Mock).mockResolvedValue({
          _id: 'note-id',
        });
        await deleteTreeNode(req as any, res as any, next);
        await flushPromises();

        expect(Note.findOneAndDelete).toHaveBeenCalled();
      });

      test('deletes children recursively when type is folder', async () => {
        await deleteTreeNode(req as any, res as any, next);
        await flushPromises();

        expect(deleteNodeChildren).toHaveBeenCalledWith(
          mockNodeId.toString(),
          mockUserId.toString(),
        );
      });
    });

    describe('on success', () => {
      test('returns 200 on success', async () => {
        await deleteTreeNode(req as any, res as any, next);
        await flushPromises();

        expect(res.status).toHaveBeenCalledWith(200);
        const body = (res.json as jest.Mock).mock.calls[0][0];
        expect(body.success).toBe(true);
      });

      test('includes deletion statistics in response', async () => {
        await deleteTreeNode(req as any, res as any, next);
        await flushPromises();

        const body = (res.json as jest.Mock).mock.calls[0][0];
        expect(body.statistics).toHaveProperty('deletedNodes');
        expect(body.statistics).toHaveProperty('deletedNotes');
      });
    });
  });

  // -------------------------
  // softDeleteTreeNode
  // -------------------------
  describe('softDeleteTreeNode', () => {
    test('throws when user is not authenticated', async () => {
      req = buildReq({ user: undefined });
      await softDeleteTreeNode(req as any, res as any, next);
      await flushPromises();

      expect(next.mock.calls[0][0].message).toBe('User not authenticated');
    });

    test('throws when node does not exist or unauthorized', async () => {
      (TreeNode.findOne as jest.Mock).mockResolvedValue(null);
      await softDeleteTreeNode(req as any, res as any, next);
      await flushPromises();

      expect(next.mock.calls[0][0].message).toBe(
        'Tree node does not exist or unauthorized',
      );
    });

    test('throws when node is already deleted', async () => {
      (TreeNode.findOne as jest.Mock).mockResolvedValue({
        ...mockTreeNode,
        isDeleted: true,
      });
      await softDeleteTreeNode(req as any, res as any, next);
      await flushPromises();

      expect(next.mock.calls[0][0].message).toBe('Node already deleted');
    });

    test('calls updateNodeAndChildrenRecursively with isDeleted true', async () => {
      await softDeleteTreeNode(req as any, res as any, next);
      await flushPromises();

      expect(updateNodeAndChildrenRecursively).toHaveBeenCalledWith(
        mockNodeId.toString(),
        mockUserId.toString(),
        expect.objectContaining({ isDeleted: true }),
      );
    });

    test('returns 200 on success', async () => {
      await softDeleteTreeNode(req as any, res as any, next);
      await flushPromises();

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  // -------------------------
  // archiveTreeNode
  // -------------------------
  describe('archiveTreeNode', () => {
    test('throws when user is not authenticated', async () => {
      req = buildReq({ user: undefined });
      await archiveTreeNode(req as any, res as any, next);
      await flushPromises();

      expect(next.mock.calls[0][0].message).toBe('User not authenticated');
    });

    test('throws when node does not exist or unauthorized', async () => {
      (TreeNode.findOne as jest.Mock).mockResolvedValue(null);
      await archiveTreeNode(req as any, res as any, next);
      await flushPromises();

      expect(next.mock.calls[0][0].message).toBe(
        'Tree node does not exist or unauthorized',
      );
    });

    test('throws when node is already archived', async () => {
      (TreeNode.findOne as jest.Mock).mockResolvedValue({
        ...mockTreeNode,
        isArchived: true,
      });
      await archiveTreeNode(req as any, res as any, next);
      await flushPromises();

      expect(next.mock.calls[0][0].message).toBe('Node already archived');
    });

    test('throws when trying to archive a deleted node', async () => {
      (TreeNode.findOne as jest.Mock).mockResolvedValue({
        ...mockTreeNode,
        isDeleted: true,
      });
      await archiveTreeNode(req as any, res as any, next);
      await flushPromises();

      expect(next.mock.calls[0][0].message).toBe(
        'Cannot archive a deleted node',
      );
    });

    test('calls updateNodeAndChildrenRecursively with isArchived true', async () => {
      await archiveTreeNode(req as any, res as any, next);
      await flushPromises();

      expect(updateNodeAndChildrenRecursively).toHaveBeenCalledWith(
        mockNodeId.toString(),
        mockUserId.toString(),
        expect.objectContaining({ isArchived: true }),
      );
    });

    test('returns 200 on success', async () => {
      await archiveTreeNode(req as any, res as any, next);
      await flushPromises();

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
