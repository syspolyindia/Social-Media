import { asyncHandler } from "../../utils/asyncHandler.js";
import { User } from "../../models/user.model.js";
import { Post } from "../../models/post.model.js";
import { Comment } from "../../models/comment.model.js";
import { Like } from "../../models/like.model.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import mongoose from "mongoose";
import { ApiError } from "../../utils/ApiError.js";
import { Subscription } from "../../models/subscription.model.js";
import { deleteFromCloudinary } from "../../utils/cloudinary.js";

const fetchAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select("-password -refreshToken");

    if (!users) throw new ApiError(500, "Users were not fetched!");

    users.forEach((user) => {
        user.date = user.createdAt.toLocaleDateString();
    })

    return res
        .status(200)
        .json(new ApiResponse(200, users, "Users fetched successfully"));
});

const changeUserStatus = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId || !mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Not a valid id")
    }

    const { status } = req.body;

    if (typeof status !== "boolean") throw new ApiError(400, "Status must be a boolean (true or false)!");

    const user = await User.findById(userId);

    if (!user) throw new ApiError(404, "User not found!");

    user.status = status;

    await user.save();

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User status changed successfully"));

});

const deleteUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId || !mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Not a valid id")
    }

    try {
        await Promise.all([
            Post.deleteMany({ owner: userId }),
            Subscription.deleteMany({ subscribedUser: userId }),
            Subscription.deleteMany({ subscriber: userId }),
            Comment.deleteMany({ owner: userId }),
            Like.deleteMany({ likedBy: userId })
        ]);
    }
    catch (error) {
        console.error("Delete user data error:", error);
        throw new ApiError(500, "Some error occured while deleting user data!");
    }

    const user = await User.findById(userId);
    console.log(user.coverImage);

    if (user.avatar) {
        const deleteImage = await deleteFromCloudinary(user.avatar);
        if (!deleteImage) throw new ApiError(500, "User avatar was not deleted due to server error");
    }
    if(user.coverImage){
        const deleteImage = await deleteFromCloudinary(user.coverImage);
        if(!deleteImage) throw new ApiError(500, "User cover image was not deleted due to server error");
    }


    const deletedUser = await User.deleteOne({_id: userId});

    if (deletedUser.deletedCount === 0) throw new ApiError(500, "User was not deleted due to server error");

    return res
        .status(200)
        .json(new ApiResponse(200, deletedUser, "User deleted successfully"));

})
export { fetchAllUsers, changeUserStatus, deleteUser };