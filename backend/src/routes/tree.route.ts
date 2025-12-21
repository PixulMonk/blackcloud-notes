import express from 'express';
import { protectRoute } from '../middleware/auth.middleware';
import { buildTree } from '../controllers/tree.controller';

const router = express.Router();

router.get('/build', protectRoute, buildTree);

export default router;
