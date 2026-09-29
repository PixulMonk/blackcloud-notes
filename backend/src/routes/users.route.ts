import express from "express";
import { protectRoute } from "../middleware/auth.middleware";
import {
  deleteUser,
  updateUser,
  wipeVault,
} from "../controllers/users.controller";
import { sensitiveActionLimiter } from "../middleware/rateLimiters";

const router = express.Router();

router.patch("/me", protectRoute, updateUser);
router.delete("/me/vault", protectRoute, sensitiveActionLimiter, wipeVault);
router.delete("/me", protectRoute, sensitiveActionLimiter, deleteUser);

export default router;
