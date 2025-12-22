import express from 'express';
import { protectRoute } from '../middleware/auth.middleware';
import {
  getAllTreeNodes,
  getAllArchived,
  getAllDeleted,
  createTreeNode,
  updateTreeNode,
  deleteTreeNode,
  softDeleteTreeNode,
  archiveTreeNode,
} from '../controllers/treeNode.controller';

const router = express.Router();

router.get('/all', protectRoute, getAllTreeNodes);
router.get('/archived', protectRoute, getAllArchived);
router.get('/deleted', protectRoute, getAllDeleted);
router.post('/create', protectRoute, createTreeNode);
router.patch('/:id', protectRoute, updateTreeNode);
router.patch('/:id/soft-delete', protectRoute, softDeleteTreeNode);
router.patch('/:id/archive', protectRoute, archiveTreeNode);
router.delete('/:id', protectRoute, deleteTreeNode);

export default router;
