import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler';
import { TreeNode } from '../models/treeNode.model';
import { Note } from '../models/note.model';
import {
  deleteNodeChildren,
  updateNodeAndChildrenRecursively,
} from '../utils/treeHelpers';

export const getAllTreeNodes = asyncHandler(async (req, res) => {
  // Returns a FLAT array of all nodes
  const userId = req.user?._id;

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const userTreenodes = await TreeNode.find({ userId, isDeleted: false });

  res.status(200).json(userTreenodes);
});

export const getAllDeleted = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const deletedTreeNodes = await TreeNode.find({ userId, isDeleted: true });

  res.status(200).json(deletedTreeNodes);
});

export const getAllArchived = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const archivedTreeNodes = await TreeNode.find({ userId, isArchived: true });

  res.status(200).json(archivedTreeNodes);
});

export const createTreeNode = asyncHandler(async (req, res) => {
  const { title, type, isArchived, isDeleted, icon, parentId } = req.body ?? {};
  let message = '';
  let fileId = null;

  if (!req.user?._id) {
    throw new Error('User not authenticated');
  }

  if (type === 'file') {
    message = 'File created successfully';
    const newNote = new Note({
      userId: req.user._id,
      title: title || 'Untitled document',
      encryptedContent: '',
      tags: [],
    });

    await newNote.save(); // Save first, then get ID
    fileId = newNote._id;
  } else {
    message = 'Folder created successfully';
  }

  const siblingCount = await TreeNode.countDocuments({
    userId: req.user._id,
    parentId: parentId || null,
    isDeleted: false,
  });

  const newTreeNode = new TreeNode({
    userId: req.user._id,
    title: title || 'Untitled document',
    type,
    position: siblingCount,
    isArchived: isArchived ?? false,
    isDeleted: isDeleted ?? false,
    icon: icon || null,
    parentId: parentId || null,
    fileId,
  });

  await newTreeNode.save();

  res.status(201).json({
    success: true,
    message,
    data: newTreeNode,
  });
});

export const updateTreeNode = asyncHandler(async (req, res) => {
  const {
    title,
    type,
    position,
    isArchived,
    isDeleted,
    icon,
    parentId,
    fileId,
  } = req.body ?? {};

  const treeNodeId = req.params.id;

  if (!req.user?._id) {
    throw new Error('User not authenticated');
  }

  if (!treeNodeId || !mongoose.Types.ObjectId.isValid(treeNodeId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid tree node ID',
    });
  }

  // Prevent a node from being its own parent
  if (parentId && parentId.toString() === treeNodeId.toString()) {
    return res.status(400).json({
      success: false,
      message: 'A node cannot be its own parent',
    });
  }

  const updatedFields: any = {};

  if (title !== undefined) updatedFields.title = title;
  if (type !== undefined) updatedFields.type = type;
  if (position !== undefined) updatedFields.position = position;
  if (isArchived !== undefined) updatedFields.isArchived = isArchived;
  if (isDeleted !== undefined) updatedFields.isDeleted = isDeleted;
  if (icon !== undefined) updatedFields.icon = icon;
  if (parentId !== undefined) updatedFields.parentId = parentId;

  // Only allow fileId updates if node is a file
  if (fileId !== undefined && type !== 'file') {
    return res.status(400).json({
      success: false,
      message: 'Cannot assign a fileId to a folder node',
    });
  }

  const treeNodeToUpdate = await TreeNode.findOneAndUpdate(
    { _id: treeNodeId, userId: req.user._id },
    { $set: updatedFields },
    { new: true }
  );

  if (!treeNodeToUpdate) {
    throw new Error('Tree node does not exist or unauthorized');
  }

  let associatedFile = undefined;
  if (treeNodeToUpdate.type === 'file' && title !== undefined) {
    associatedFile = await Note.findOneAndUpdate(
      { _id: treeNodeToUpdate.fileId, userId: req.user._id },
      { $set: { title } },
      { new: true }
    );

    if (!associatedFile) {
      throw new Error('Associated note not found or unauthorized');
    }
  }

  res.status(200).json({
    success: true,
    message: `Tree node updated successfully (${treeNodeToUpdate.type})`,
    node: treeNodeToUpdate,
    file: associatedFile,
  });
});

export const deleteTreeNode = asyncHandler(async (req, res) => {
  const treeNodeId = req.params.id;

  if (!req.user?._id) {
    throw new Error('User not authenticated');
  }

  if (!treeNodeId || !mongoose.Types.ObjectId.isValid(treeNodeId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid tree node ID',
    });
  }

  let deletedNotesCount = 0;
  let deletedNodesCount = 0;

  // verify node belongs to user
  const treeNodeToDelete = await TreeNode.findOne({
    _id: treeNodeId,
    userId: req.user._id,
  });

  if (!treeNodeToDelete) {
    throw new Error('Tree node not found or unauthorized');
  }

  if (treeNodeToDelete.type === 'file') {
    const noteToDelete = await Note.findOneAndDelete({
      _id: treeNodeToDelete.fileId,
      userId: req.user!._id,
    });
    if (noteToDelete) deletedNotesCount++;
  }

  if (treeNodeToDelete.type === 'folder') {
    const { notes, nodes } = await deleteNodeChildren(
      treeNodeId,
      req.user!._id.toString()
    );
    deletedNotesCount += notes;
    deletedNodesCount += nodes;
  }

  // delete the root node itself
  const deletedRoot = await TreeNode.findOneAndDelete({
    _id: treeNodeId,
    userId: req.user!._id,
  });
  if (deletedRoot) deletedNodesCount++;

  const message =
    treeNodeToDelete.type === 'file'
      ? 'File and note deleted successfully'
      : `Folder deleted successfully (${deletedNodesCount} nodes, ${deletedNotesCount} notes)`;

  res.status(200).json({
    success: true,
    message,
    node: treeNodeToDelete,
    statistics: {
      deletedNodes: deletedNodesCount,
      deletedNotes: deletedNotesCount,
    },
  });
});

export const softDeleteTreeNode = asyncHandler(async (req, res) => {
  const treeNodeId = req.params.id;

  if (!req.user?._id) {
    throw new Error('User not authenticated');
  }

  if (!treeNodeId || !mongoose.Types.ObjectId.isValid(treeNodeId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid tree node ID',
    });
  }
  const treeNodeToSoftDelete = await TreeNode.findOneAndUpdate({
    _id: treeNodeId,
    userId: req.user._id,
  });

  if (!treeNodeToSoftDelete) {
    throw new Error('Tree node does not exist or unauthorized');
  }

  await updateNodeAndChildrenRecursively(treeNodeId, req.user._id.toString(), {
    isDeleted: true,
  });

  res.status(200).json({
    success: true,
    message: 'Tree node and all descendants soft-deleted successfully',
    node: treeNodeToSoftDelete,
  });
});

export const archiveTreeNode = asyncHandler(async (req, res) => {
  const treeNodeId = req.params.id;

  if (!req.user?._id) {
    throw new Error('User not authenticated');
  }

  if (!treeNodeId || !mongoose.Types.ObjectId.isValid(treeNodeId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid tree node ID',
    });
  }
  const treeNodeToArchive = await TreeNode.findOneAndUpdate({
    _id: treeNodeId,
    userId: req.user._id,
  });

  if (!treeNodeToArchive) {
    throw new Error('Tree node does not exist or unauthorized');
  }

  await updateNodeAndChildrenRecursively(treeNodeId, req.user._id.toString(), {
    isArchived: true,
  });

  res.status(200).json({
    success: true,
    message: 'Tree node and all descendants archived successfully',
    node: treeNodeToArchive,
  });
});
