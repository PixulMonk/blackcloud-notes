import mongoose from 'mongoose';
import { ENCRYPTION_CONFIG } from '@blackcloud/shared';
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
  const { encryptedTitle, type, isArchived, isDeleted, icon, parentId } =
    req.body ?? {};
  let message = '';
  let fileId = null;

  if (!req.user?._id) {
    throw new Error('User not authenticated');
  }

  if (type === 'file') {
    message = 'File created successfully';
    const newNote = new Note({
      userId: req.user._id,
      encryptedContent: '',
      schemaVersion: ENCRYPTION_CONFIG.schemaVersion,
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
    // IMPORTANT NOTE: prior to the implementation of the encryption feature, the fallback
    // if title is null was handled here on the backend. Now that the encryption feature has been
    // implemented, the fallback should happen client side.
    encryptedTitle: encryptedTitle,
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
    encryptedTitle,
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

  if (
    !treeNodeId ||
    typeof treeNodeId !== 'string' ||
    !mongoose.Types.ObjectId.isValid(treeNodeId)
  ) {
    return res.status(400).json({
      success: false,
      message: 'Invalid tree node ID',
    });
  }

  if (
    encryptedTitle !== undefined &&
    (typeof encryptedTitle !== 'string' || encryptedTitle.length === 0)
  ) {
    return res.status(400).json({
      success: false,
      message: 'Invalid encrypted title',
    });
  }

  const treeNodeToUpdate = await TreeNode.findOne(
    { _id: treeNodeId, userId: req.user._id },
    { new: true },
  );

  if (!treeNodeToUpdate) {
    throw new Error('Tree node does not exist or unauthorized');
  }

  if (treeNodeToUpdate.isDeleted) {
    return res.status(400).json({
      success: false,
      message: 'Cannot update a deleted node',
    });
  }

  if (parentId && parentId.toString() === treeNodeId.toString()) {
    return res.status(400).json({
      success: false,
      message: 'A node cannot be its own parent',
    });
  }

  const finalIsDeleted =
    isDeleted !== undefined ? isDeleted : treeNodeToUpdate.isDeleted;
  const finalIsArchived =
    isArchived !== undefined ? isArchived : treeNodeToUpdate.isArchived;

  if (isDeleted && isArchived) {
    return res.status(400).json({
      success: false,
      message: 'Node cannot be both deleted and archived',
    });
  }

  if (type !== undefined && type !== treeNodeToUpdate.type) {
    return res.status(400).json({
      success: false,
      message: 'Changing node type is not allowed',
    });
  }

  if (fileId !== undefined && type !== 'file') {
    return res.status(400).json({
      success: false,
      message: 'Cannot assign a fileId to a folder node',
    });
  }

  const updatedFields: any = {};
  if (encryptedTitle !== undefined)
    updatedFields.encryptedTitle = encryptedTitle;
  if (position !== undefined) updatedFields.position = position;
  if (isArchived !== undefined) updatedFields.isArchived = isArchived;
  if (isDeleted !== undefined) updatedFields.isDeleted = isDeleted;
  if (icon !== undefined) updatedFields.icon = icon;
  if (parentId !== undefined) updatedFields.parentId = parentId;
  if (fileId !== undefined) updatedFields.fileId = fileId;

  const updatedTreeNode = await TreeNode.findOneAndUpdate(
    { _id: treeNodeId, userId: req.user._id },
    { $set: updatedFields },
    { new: true },
  );

  res.status(200).json({
    success: true,
    message: `Tree node updated successfully (${treeNodeToUpdate.type})`,
    node: treeNodeToUpdate,
  });
});

export const deleteTreeNode = asyncHandler(async (req, res) => {
  const treeNodeId = req.params.id;

  if (!req.user?._id) {
    throw new Error('User not authenticated');
  }

  if (
    !treeNodeId ||
    typeof treeNodeId !== 'string' ||
    !mongoose.Types.ObjectId.isValid(treeNodeId)
  ) {
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
      req.user!._id.toString(),
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

// TODO: unify softDeleteTreeNode and archiveTreeNode
export const softDeleteTreeNode = asyncHandler(async (req, res) => {
  const treeNodeId = req.params.id;

  if (!req.user?._id) {
    throw new Error('User not authenticated');
  }

  if (
    !treeNodeId ||
    typeof treeNodeId !== 'string' ||
    !mongoose.Types.ObjectId.isValid(treeNodeId)
  ) {
    return res.status(400).json({
      success: false,
      message: 'Invalid tree node ID',
    });
  }

  const treeNodeToSoftDelete = await TreeNode.findOne({
    _id: treeNodeId,
    userId: req.user._id,
  });

  if (!treeNodeToSoftDelete) {
    throw new Error('Tree node does not exist or unauthorized');
  }

  if (treeNodeToSoftDelete.isDeleted) {
    throw new Error('Node already deleted');
  }

  await updateNodeAndChildrenRecursively(treeNodeId, req.user._id.toString(), {
    isDeleted: true,
    deletedAt: new Date(),
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

  if (
    !treeNodeId ||
    typeof treeNodeId !== 'string' ||
    !mongoose.Types.ObjectId.isValid(treeNodeId)
  ) {
    return res.status(400).json({
      success: false,
      message: 'Invalid tree node ID',
    });
  }
  const treeNodeToArchive = await TreeNode.findOne({
    _id: treeNodeId,
    userId: req.user._id,
  });

  if (!treeNodeToArchive) {
    throw new Error('Tree node does not exist or unauthorized');
  }

  if (treeNodeToArchive.isArchived) {
    throw new Error('Node already archived');
  }

  if (treeNodeToArchive.isDeleted) {
    throw new Error('Cannot archive a deleted node');
  }

  await updateNodeAndChildrenRecursively(treeNodeId, req.user._id.toString(), {
    isArchived: true,
    archivedAt: new Date(),
  });

  res.status(200).json({
    success: true,
    message: 'Tree node and all descendants archived successfully',
    node: treeNodeToArchive,
  });
});
