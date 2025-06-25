import { Router } from "express";
import { deletePost, editPost, getPostById, getUserPosts, uploadPost } from "../controllers/post.controller.js";
import { upload } from '../middlewares/multer.middleware.js';
import { verfiyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verfiyJWT); 
router
    .route("/upload")
    .post(
        upload.fields([
            {
                name: "image",
                maxCount : 1
            }
        ]),
        uploadPost
    );

router
    .route("/:postId")
    .get(getPostById);

router
    .route("/:postId")
    .delete(deletePost);

router
    .route("/u/:userId")
    .get(getUserPosts);

router
    .route("/:postId")
    .patch(upload.fields([
        {
            name: "image",
            maxCount : 1
        }
    ]),editPost);

export default router;