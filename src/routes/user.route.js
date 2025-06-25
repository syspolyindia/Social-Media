import { Router } from 'express';
import { upload } from '../middlewares/multer.middleware.js';
import { registerUser, loginUser, logoutUser, updateUserAvatar, updateUserCoverImage, updateUserFullName, getUserChannelProfile} from '../controllers/user.controller.js';
import { verfiyJWT } from '../middlewares/auth.middleware.js';
const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name : "avatar",
            maxCount : 1
        },
        {
            name : "coverImage",
            maxCount: 1
        }
    ]), //adding a middleware which will act just before the execution of 'registerUser', this middleware enables taking input of files from user. We're gonna take input 2 image files 'avatar' and 'coverImage'
    registerUser);
// if anyone hits api/v1/user/register with post request 'registerUser' callback is executed.

router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verfiyJWT, logoutUser);

router.route("/update-fullName").patch(verfiyJWT, updateUserFullName);
router.route("/update-avatar").patch(verfiyJWT, upload.single("avatar"), updateUserAvatar);
router.route("/update-coverImage").patch(verfiyJWT, upload.single("coverImage"), updateUserCoverImage);

router.route("/c/:username").get(verfiyJWT, getUserChannelProfile);
// the username of the channel whose profile is being looked at will be at place of ':username' in the route.

export default router;