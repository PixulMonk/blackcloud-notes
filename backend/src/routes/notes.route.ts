import express from "express";
import { protectRoute } from "../middleware/auth.middleware";
import {
  createNote,
  deleteNote,
  getAllNotes,
  getNote,
  getNotesForExport,
  updateNote,
} from "../controllers/notes.controller";

const router = express.Router();

router.get("/all", protectRoute, getAllNotes);
router.get("/export", protectRoute, getNotesForExport);
router.get("/:id", protectRoute, getNote);
router.post("/create", protectRoute, createNote);
router.patch("/:id", protectRoute, updateNote);
router.delete("/:id", protectRoute, deleteNote);

export default router;
