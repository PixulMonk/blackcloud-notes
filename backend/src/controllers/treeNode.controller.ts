import asyncHandler from '../utils/asyncHandler';
import { TreeNode } from '../models/treeNode.model';
import { Note } from '../models/note.model';
import { deleteNodeChildren } from '../utils/treeHelpers';

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
    icon: icon || null, // null instead of empty string
    parentId: parentId || null, // Fix: null instead of empty string
    fileId,
  });

  await newTreeNode.save();

  res.status(201).json({
    success: true,
    message,
    data: newTreeNode, // Fix: better property name
  });
});

export const updateTreeNode = asyncHandler(async (req, res) => {
  // TODO: if file, make sure that RELEVANT FIELDS (eg. title, etc.) are updated on the note too
});

export const deleteTreeNode = asyncHandler(async (req, res) => {
  const treeNodeId = req.params.id;

  if (!req.user?._id) {
    throw new Error('User not authenticated');
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
