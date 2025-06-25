import { Router } from 'express';
import { checkSubscription, getSubscribedUsers, toggleSubscription } from '../controllers/subscription.controller.js';
import { verfiyJWT } from '../middlewares/auth.middleware.js';
const router = Router();

router.use(verfiyJWT);

router
    .route("/toggle/:userId")
    .post(toggleSubscription);

router
    .route("/check/:userId")
    .get(checkSubscription);

router
    .route("/")
    .get(getSubscribedUsers);
    
export default router;