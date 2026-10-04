import { protectRoute } from "../middleware/auth.middleware";
import router from "../routes/users.route";
import {
  getNotesForExport,
  importNotes,
} from "../controllers/vault.controller";

router.get("/export", protectRoute, getNotesForExport);
router.get("/import", protectRoute, importNotes);

export default router;
