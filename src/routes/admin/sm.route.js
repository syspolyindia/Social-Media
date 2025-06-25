import {Router} from "express";
import { adminAuth } from "../../middlewares/adminAuth.middleware.js";
import { fetchAllSubscriptions } from "../../controllers/admin/sm.controller.js";

const router = Router();
router.use(adminAuth);

router
    .route("/")
    .get(fetchAllSubscriptions);

export default router;