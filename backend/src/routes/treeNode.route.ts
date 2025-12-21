import express from 'express';
import { protectRoute } from '../middleware/auth.middleware';
import {
  getAllTreeNodes,
  getAllArchived,
  getAllDeleted,
  createTreeNode,
  updateTreeNode,
  deleteTreeNode,
} from '../controllers/treeNode.controller';

const router = express.Router();

router.get('/all', protectRoute, getAllTreeNodes);
router.get('/archived', protectRoute, getAllArchived);
router.get('/deleted', protectRoute, getAllDeleted);
router.post('/create', protectRoute, createTreeNode);
router.patch('/:id', protectRoute, updateTreeNode);
router.delete('/:id', protectRoute, deleteTreeNode);

export default router;
