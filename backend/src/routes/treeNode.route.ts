import express from 'express';
import { protectRoute } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/all', protectRoute);
router.get('/archived', protectRoute);
router.get('/deleted', protectRoute);
router.post('/create', protectRoute);
router.patch('/:id', protectRoute);
router.delete('/:id', protectRoute);

export default router;
