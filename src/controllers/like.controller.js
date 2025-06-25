import { asyncHandler } from "../utils/asyncHandler.js";
import { Post } from "../models/post.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { Comment } from "../models/comment.model.js";
import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";

const togglePostLike = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    if (!postId || !mongoose.isValidObjectId(postId)) {
        throw new ApiError(400, "Not a valid id")
    }

    const post = await Post.findById(postId);

    if (!post) throw new ApiError(404, "Post not found!");

    const isLiked = await Like.findOne({
        post: new mongoose.Types.ObjectId(postId),
        likedBy: new mongoose.Types.ObjectId(req.user._id)
    });

    if(isLiked){
        const deleteLike = await Like.deleteOne({
            post: new mongoose.Types.ObjectId(postId),
            likedBy: new mongoose.Types.ObjectId(req.user._id)
        });

        if(!deleteLike.deletedCount) throw new ApiError(500, "Some error occured while trying to unlike");

        return res.status(200).json(new ApiResponse(200, deleteLike, "Post has been unliked successfully!"));
    }
    else{
        const createLike = await Like.create({
            post: new mongoose.Types.ObjectId(postId),
            likedBy: new mongoose.Types.ObjectId(req.user._id)
        });

        if(!createLike) throw new ApiError(500, "Some error occured while trying to like");

        const like = await Like.findById(createLike._id).populate('likedBy', 'username fullName')

        return res.status(200).json(new ApiResponse(200, like, "Post has been liked successfully!"));
    }
});

const checkPostLike = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    if (!postId || !mongoose.isValidObjectId(postId)) {
        throw new ApiError(400, "Not a valid id")
    }

    const like = await Like.findOne({
        post: new mongoose.Types.ObjectId(postId),
        likedBy: new mongoose.Types.ObjectId(req.user._id)
    });

    if(like){
        return res
        .status(200)
        .json( new ApiResponse(200, {isLiked: true}, "You have liked this post"));
    }
    else{
        return res
        .status(200)
        .json( new ApiResponse(200, {isLiked: false}, "You have not liked this post"));
    }
});

const getPostLikes = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    if (!postId || !mongoose.isValidObjectId(postId)) {
        throw new ApiError(400, "Not a valid id")
    }

    const post = await Post.findById(postId);

    if (!post) throw new ApiError(404, "Post not found!");

    const likeCount = await Like.countDocuments({ post: new mongoose.Types.ObjectId(postId) });

    return res
    .status(200)
    .json( new ApiResponse(200, {likeCount}, "Like count fetched successfully!"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!commentId || !mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Not a valid id")
    }

    const comment = await Comment.findById(commentId);

    if (!comment) throw new ApiError(404, "Comment not found!");

    const isLiked = await Like.findOne({
        comment: new mongoose.Types.ObjectId(commentId),
        likedBy: new mongoose.Types.ObjectId(req.user._id)
    });

    if(isLiked){
        const deleteLike = await Like.deleteOne({
            comment: new mongoose.Types.ObjectId(commentId),
            likedBy: new mongoose.Types.ObjectId(req.user._id)
        });

        if(!deleteLike.deletedCount) throw new ApiError(500, "Some error occured while trying to unlike");

        return res.status(200).json(new ApiResponse(200, deleteLike, "Comment has been unliked successfully!"));
    }
    else{
        const createLike = await Like.create({
            comment: new mongoose.Types.ObjectId(commentId),
            likedBy: new mongoose.Types.ObjectId(req.user._id)
        });

        if(!createLike) throw new ApiError(500, "Some error occured while trying to like");

        const like = await Like.findById(createLike._id).populate('likedBy', 'username fullName')

        return res.status(200).json(new ApiResponse(200, like, "Comment has been liked successfully!"));
    }
});

const checkCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!commentId || !mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Not a valid id")
    }

    const like = await Like.findOne({
        comment: new mongoose.Types.ObjectId(commentId),
        likedBy: new mongoose.Types.ObjectId(req.user._id)
    });

    if(like){
        return res
        .status(200)
        .json( new ApiResponse(200, {isLiked: true}, "You have liked this comment"));
    }
    else{
        return res
        .status(200)
        .json( new ApiResponse(200, {isLiked: false}, "You have not liked this comment"));
    }
});

const getCommentLikes = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!commentId || !mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Not a valid id")
    }

    const comment = await Comment.findById(commentId);

    if (!comment) throw new ApiError(404, "Comment not found!");

    const likeCount = await Like.countDocuments({ comment: new mongoose.Types.ObjectId(commentId) });

    return res
    .status(200)
    .json( new ApiResponse(200, {likeCount}, "Like count fetched successfully!"));
});

export { togglePostLike, checkPostLike, getPostLikes, toggleCommentLike, checkCommentLike, getCommentLikes };