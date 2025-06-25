import { Router } from "express";
import { checkCommentLike, checkPostLike, getCommentLikes, getPostLikes, toggleCommentLike, togglePostLike } from "../controllers/like.controller.js";
import { verfiyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verfiyJWT); 

router
    .route("/toggle-post-like/:postId")
    .put(togglePostLike);

router
    .route("/check-post-like/:postId")
    .get(checkPostLike);

router
    .route('/get-post-likes/:postId')
    .get(getPostLikes);

router
    .route("/toggle-comment-like/:commentId")
    .put(toggleCommentLike);

router
    .route("/check-comment-like/:commentId")
    .get(checkCommentLike);

router
    .route("/get-comment-likes/:commentId")
    .get(getCommentLikes);
    
export default router;