import {Router} from "express";
import { adminAuth } from "../../middlewares/adminAuth.middleware.js";
import { deleteComment, fetchAllComments, getTotalLikes } from "../../controllers/admin/cm.controller.js";

const router = Router();
router.use(adminAuth); 

router
    .route("/")
    .get(fetchAllComments);

router
    .route("/get-total-likes/:commentId")
    .get(getTotalLikes);

router
    .route("/:commentId")
    .delete(deleteComment)

export default router;  