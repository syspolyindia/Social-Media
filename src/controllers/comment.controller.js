import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Post } from "../models/post.model.js";
import { Like } from "../models/like.model.js";
import mongoose from "mongoose";

const addComment = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    if (!postId || !mongoose.isValidObjectId(postId)) {
        throw new ApiError(400, "Not a valid id")
    }

    const post = await Post.findById(postId);

    if (!post) throw new ApiError(404, "Post not found!");

    const { content } = req.body;
    if (!content?.trim()) throw new ApiError(400, "Content is required!");

    const comment = await Comment.create({
        post: post._id,
        content: content,
        owner: req.user._id
    });

    if (!comment) throw new ApiError(500, "Server Error!");

    return res
        .status(200)
        .json(new ApiResponse(200, comment, "Comment added successfully!"));
});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!commentId || !mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Not a valid id")
    }

    const comment = await Comment.findById(commentId);

    if (!comment) throw new ApiError(404, "Comment not found!");

    if (!comment.owner.equals(req.user._id)) throw new ApiError(401, "Unauthorized request");

    try {
        await Like.deleteMany({ comment: new mongoose.Types.ObjectId(commentId) });
    }
    catch (error) {
        console.error("Delete user data error:", error);
        throw new ApiError(500, "Some error occured while deleting comment data!");
    }

    const deletedComment = await Comment.deleteOne({ _id: commentId });

    if (!deletedComment) throw new ApiError(500, "Server Error!");

    return res
        .status(200)
        .json(new ApiResponse(200, deletedComment, "Comment deleted successfully!"));
})

const getPostComments = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    if (!postId || !mongoose.isValidObjectId(postId)) {
        throw new ApiError(400, "Not a valid id")
    }

    const post = await Post.findById(postId);

    if (!post) throw new ApiError(404, "Post not found!");

    const comments = await Comment.find({ post: postId }).populate('owner', 'username avatar');

    if (!comments) throw new ApiError(500, "Some error occured while fetching comments!");

    return res
        .status(200)
        .json(new ApiResponse(200, comments, "Comments fetched successfully!"));

});

export { addComment, deleteComment, getPostComments };