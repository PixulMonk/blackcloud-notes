import { Request, Response } from 'express';

import asyncHandler from '../utils/asyncHandler';
import { TreeNode, ITreeNode } from '../models/treeNode.model';
import { TreeNodeWithChildren, TreeResponse } from '../types/tree.types';

export const buildTree = asyncHandler(
  async (
    req: Request<{}, TreeResponse, {}>,
    res: Response<TreeResponse>,
  ): Promise<void> => {
    const userId = req.user?._id;
    if (!userId) throw new Error('Unauthorized');

    const nodes: ITreeNode[] = await TreeNode.find({
      userId,
      isDeleted: false,
      isArchived: false,
    });

    const result: TreeNodeWithChildren[] = [];

    // Map of node ID and their respective children
    const nodeMap: Record<string, TreeNodeWithChildren> = {};

    // Step 1: put every node into nodeMap and give it an empty children array
    nodes.forEach((node) => {
      nodeMap[node._id.toString()] = { ...node.toObject(), children: [] };
    });

    // Step 2: link children to parents
    nodes.forEach((node) => {
      // Skip any node whose parent was deleted
      if (node.parentId && !nodeMap[node.parentId.toString()]) return;

      // Has parents = attach to its parent's children array
      if (node.parentId) {
        const parent = nodeMap[node.parentId.toString()];
        if (parent) {
          parent.children!.push(nodeMap[node._id.toString()]);
        }
      } else {
        // No parents = true root. Push to result JSON
        // You only need to push the root to the result JSON. Only have to add children to the array
        result.push(nodeMap[node._id.toString()]);
      }
    });

    res.status(200).json({
      success: true,
      message: 'Tree built successfully',
      tree: result,
    });
  },
);
