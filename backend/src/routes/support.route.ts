import express from "express";
import { submitSupportRequest } from "../controllers/support.controller";
import { protectRoute } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/submit", protectRoute, submitSupportRequest);

export default router;
