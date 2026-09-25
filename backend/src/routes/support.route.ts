import express from "express";

import { submitSupportRequest } from "../controllers/support.controller";
import { protectRoute } from "../middleware/auth.middleware";
import { contactLimiter } from "../middleware/rateLimiters";

const router = express.Router();

router.post("/submit", contactLimiter, protectRoute, submitSupportRequest);

export default router;
