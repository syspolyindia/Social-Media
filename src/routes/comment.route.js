import { Router } from "express";
import { verfiyJWT } from "../middlewares/auth.middleware.js";
import { addComment, deleteComment, getPostComments } from "../controllers/comment.controller.js";

const router = Router();
router.use(verfiyJWT); 

router
    .route("/add/:postId")
    .post(addComment);

router
    .route("/delete/:commentId")
    .delete(deleteComment);

router
    .route("/:postId")
    .get(getPostComments);

export default router;