import { Router } from 'express';
import { acceptReferral, createReferral,getOwnReferrals, rejectReferral } from '../controllers/referral.controller.js';
import { verfiyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verfiyJWT); 

router
    .route("/create")
    .post(createReferral);

router
    .route("/")
    .get(getOwnReferrals);

router
    .route("/accept/:referralId")
    .patch(acceptReferral);

router
    .route("/reject/:referralId")
    .delete(rejectReferral);

export default router;