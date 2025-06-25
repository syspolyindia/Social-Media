import {Router} from "express";
import { adminAuth } from "../../middlewares/adminAuth.middleware.js";
import { fetchAllPosts,deletePost, getTotalLikes } from "../../controllers/admin/pm.controller.js";


const router = Router();
router.use(adminAuth); 

router
    .route("/")
    .get(fetchAllPosts)

router
    .route("/:postId")
    .delete(deletePost);

router
    .route("/get-total-likes/:postId")
    .get(getTotalLikes);

export default router;