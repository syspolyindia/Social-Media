import { asyncHandler } from "../../utils/asyncHandler.js";
import { Comment } from "../../models/comment.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import mongoose from "mongoose";
import { Like } from "../../models/like.model.js";

const fetchAllComments = asyncHandler(async (req, res) => {
    const comments = await Comment.find()
        .populate('owner', 'username avatar')
        .populate({
            path: 'post',
            select: 'content image link owner',
            populate: {
                path: 'owner',
                select: 'username avatar'
            }
        });

    if (!comments) throw new ApiError(404, "Comments not found!");

    comments.forEach((comment) => {
        comment.date = comment.createdAt.toLocaleDateString();
    });

    return res
        .status(200)
        .json(new ApiResponse(200, comments, "Comments fetched successfully!"));
})

const getTotalLikes = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!commentId || !mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Not a valid id")
    }

    const Likes = await Like.countDocuments({
        comment: new mongoose.Types.ObjectId(commentId)
    });

    return res
        .status(200)
        .json(new ApiResponse(200, { likeCount: Likes }, "Like count fetched successfully!"));
});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!commentId || !mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Not a valid id")
    }

    try {
        await Like.deleteMany({ comment: new mongoose.Types.ObjectId(commentId) });
    }
    catch (error) {
        console.error("Delete user data error:", error);
        throw new ApiError(500, "Some error occured while deleting comment data!");
    }

    const deletedComment = await Comment.deleteOne({ _id: commentId });

    if (!deletedComment) throw new ApiError(404, "Comment not found!");

    return res
        .status(200)
        .json(new ApiResponse(200, deletedComment, "Comment deleted successfully!"));
});

export { fetchAllComments, getTotalLikes, deleteComment }