import { Request, Response } from 'express';
import mongoose from 'mongoose';

import { buildRes, buildMockUser } from '../../src/lib/testHelpers';
import { buildTree } from '../../src/controllers/tree.controller';
import { TreeNode } from '../../src/models/treeNode.model';

jest.mock('../../src/models/treeNode.model');

const mockUserId = new mongoose.Types.ObjectId();

const buildReq = (overrides: Partial<Request> = {}): Partial<Request> => ({
  user: { ...buildMockUser(), _id: mockUserId } as any,
  ...overrides,
});

const flushPromises = () => new Promise(process.nextTick);

// Helper to create a mock tree node
const makeMockNode = (overrides = {}): any => ({
  _id: new mongoose.Types.ObjectId(),
  userId: mockUserId,
  parentId: null,
  isDeleted: false,
  isArchived: false,
  type: 'folder',
  toObject: jest.fn().mockReturnThis(),
  ...overrides,
});

describe('Tree Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    res = buildRes();
    next = jest.fn();
    req = buildReq();
  });

  describe('authorization', () => {
    test('throws when user is not authenticated', async () => {
      req = buildReq({ user: undefined });
      await buildTree(req as Request, res as Response, next);
      await flushPromises();

      expect(next.mock.calls[0][0].message).toBe('Unauthorized');
    });
  });

  describe('tree building', () => {
    test('queries only non-deleted non-archived nodes for the user', async () => {
      (TreeNode.find as jest.Mock).mockResolvedValue([]);
      await buildTree(req as Request, res as Response, next);
      await flushPromises();

      expect(TreeNode.find).toHaveBeenCalledWith({
        userId: mockUserId,
        isDeleted: false,
        isArchived: false,
      });
    });

    test('returns empty tree when user has no nodes', async () => {
      (TreeNode.find as jest.Mock).mockResolvedValue([]);
      await buildTree(req as Request, res as Response, next);
      await flushPromises();

      const body = (res.json as jest.Mock).mock.calls[0][0];
      expect(body.tree).toEqual([]);
    });

    test('returns root nodes at top level', async () => {
      const rootNode = makeMockNode({ parentId: null });
      (TreeNode.find as jest.Mock).mockResolvedValue([rootNode]);
      await buildTree(req as Request, res as Response, next);
      await flushPromises();

      const body = (res.json as jest.Mock).mock.calls[0][0];
      expect(body.tree).toHaveLength(1);
    });

    test('nests child nodes under their parent', async () => {
      const parent = makeMockNode({ parentId: null });
      const child = makeMockNode({ parentId: parent._id });

      // toObject needs to return a plain object
      parent.toObject = jest.fn().mockReturnValue({ ...parent, children: [] });
      child.toObject = jest.fn().mockReturnValue({ ...child, children: [] });

      (TreeNode.find as jest.Mock).mockResolvedValue([parent, child]);
      await buildTree(req as Request, res as Response, next);
      await flushPromises();

      const body = (res.json as jest.Mock).mock.calls[0][0];
      expect(body.tree).toHaveLength(1); // only root at top level
      expect(body.tree[0].children).toHaveLength(1); // child nested under parent
    });

    test('skips children whose parent was deleted', async () => {
      const orphanChild = makeMockNode({
        parentId: new mongoose.Types.ObjectId(), // parent not in results
      });
      orphanChild.toObject = jest.fn().mockReturnValue({ ...orphanChild, children: [] });

      (TreeNode.find as jest.Mock).mockResolvedValue([orphanChild]);
      await buildTree(req as Request, res as Response, next);
      await flushPromises();

      const body = (res.json as jest.Mock).mock.calls[0][0];
      expect(body.tree).toHaveLength(0); // orphan skipped
    });
  });

  describe('on success', () => {
    test('returns 200 with success true', async () => {
      (TreeNode.find as jest.Mock).mockResolvedValue([]);
      await buildTree(req as Request, res as Response, next);
      await flushPromises();

      expect(res.status).toHaveBeenCalledWith(200);
      const body = (res.json as jest.Mock).mock.calls[0][0];
      expect(body.success).toBe(true);
    });
  });
});
