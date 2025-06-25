import { asyncHandler } from "../../utils/asyncHandler.js";
import { Post } from "../../models/post.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { Like } from "../../models/like.model.js";
import { Comment } from "../../models/comment.model.js";
import { deleteFromCloudinary } from "../../utils/cloudinary.js";
import mongoose from "mongoose";

const fetchAllPosts = asyncHandler(async (req, res) => {
    const allPosts = await Post.find().populate('owner', 'username').lean();

    if (!allPosts) throw new ApiError(500, "Posts were not fetched!");

    allPosts.forEach((post) => {
        post.date = post.createdAt.toLocaleDateString();
    })

    return res
        .status(200)
        .json(new ApiResponse(200, allPosts, "Posts fetched successfully!"));

});

const deletePost = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    if (!postId || !mongoose.isValidObjectId(postId)) {
        throw new ApiError(400, "Not a valid id")
    }

    try {
        const comments = await Comment.find({post: new mongoose.Types.ObjectId(postId)});
        const commentIds = comments.map(comment => comment._id);

        await Promise.all([
            Like.deleteMany({ $or: [{ post: new mongoose.Types.ObjectId(postId) }, { comment: { $in: commentIds } }] }),
            Comment.deleteMany({ post: new mongoose.Types.ObjectId(postId) })
        ])
    }
    catch (error) {
        console.error("Delete user data error:", error);
        throw new ApiError(500, "Some error occured while deleting post data!");
    }

    const post = await Post.findById(postId);

    if (!post) throw new ApiError(404, "Post not found!"); 

    console.log(post.image);
    if(post.image){
        const deleteImage = await deleteFromCloudinary(post.image);
        if(!deleteImage) throw new ApiError(500, "Post was not deleted due to server error");
    }

    const deletedPost = await Post.deleteOne({ _id: postId });

    if (deletedPost.deletedCount === 0) {
        throw new ApiError(404, "Post not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, deletedPost, "Post deleted successfully!"));
})

const getTotalLikes = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    if (!postId || !mongoose.isValidObjectId(postId)) {
        throw new ApiError(400, "Not a valid id")
    }

    const Likes = await Like.countDocuments({
        post: new mongoose.Types.ObjectId(postId)
    });

    return res
        .status(200)
        .json(new ApiResponse(200, { likeCount: Likes }, "Like count fetched successfully!"));
})

export { fetchAllPosts, deletePost, getTotalLikes }