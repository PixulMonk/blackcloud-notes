import express from "express";
import { protectRoute } from "../middleware/auth.middleware";
import { deleteUser, updateUser } from "../controllers/users.controller";

const router = express.Router();

router.patch("/me", protectRoute, updateUser);
router.delete("/me", protectRoute, deleteUser);

export default router;
