import express from 'express';
import {
  signup,
  login,
  getLoginMetadata,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  checkAuth,
  resendVerificationEmail,
} from '../controllers/auth.controller';
import { protectRoute } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/check-auth', protectRoute, checkAuth);
router.post('/getLoginMetadata', getLoginMetadata);
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/resend-verification', resendVerificationEmail);

export default router;
