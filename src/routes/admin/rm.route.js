import {Router} from "express";
import { adminAuth } from "../../middlewares/adminAuth.middleware.js";
import { fetchAllReferrals, fetchReferralValue, updateReferralValue } from "../../controllers/admin/rm.controller.js";

const router = Router();
router.use(adminAuth); 

router
    .route("/")
    .get(fetchAllReferrals);

router
    .route("/fetch-referral-value")
    .get(fetchReferralValue);

router
    .route("/update-referral-value")
    .patch(updateReferralValue);

export default router;