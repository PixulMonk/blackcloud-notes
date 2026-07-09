import express from 'express';
import { checkHealth } from '../controllers/health.controller';

const router = express.Router();

router.get('/ping', checkHealth);

export default router;
