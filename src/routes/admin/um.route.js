import {Router} from "express";
import { adminAuth } from "../../middlewares/adminAuth.middleware.js";
import { changeUserStatus, deleteUser, fetchAllUsers } from "../../controllers/admin/um.controller.js";

const router = Router();
router.use(adminAuth); 

router
    .route("/")
    .get(fetchAllUsers)

router
    .route("/:userId/change-status")
    .patch(changeUserStatus);

router
    .route("/:userId")
    .delete(deleteUser);

export default router;