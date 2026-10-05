import { protectRoute } from "../middleware/auth.middleware";
import router from "../routes/users.route";
import {
  getNotesForExport,
  importVault,
} from "../controllers/vault.controller";

router.get("/export", protectRoute, getNotesForExport);
router.post("/import", protectRoute, importVault);

export default router;
