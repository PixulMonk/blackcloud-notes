import express from 'express';
import {
  signup,
  login,
  getSalt,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  checkAuth,
} from '../controllers/auth.controller';
import { protectRoute } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/check-auth', protectRoute, checkAuth);
router.post('/signup', signup);
router.post('/login', login);
router.post('/getSalt', getSalt);
router.post('/logout', logout);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;
