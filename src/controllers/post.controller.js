import mongoose from "mongoose";
import { Post } from "../models/post.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";

const uploadPost = asyncHandler(async (req, res)=>{
    const { content, link } = req.body;

    if(!content?.trim()) throw new ApiError(400, "Content is required");


    const imageLocalPath = req.files?.image?.[0].path;

    let image = null;

    if(imageLocalPath){
        image = await uploadOnCloudinary(imageLocalPath);
        if(!image) throw new ApiError(500, "Error while uploading the images on our servers");
    }
    
    const post = await Post.create({
        content: content,
        link: link || "",
        image: image?.url || "", 
        owner: req.user._id
    })
    
    if(!post) throw new ApiError(500, "Server Error!");
    
    const finalPost = await Post.findById(post._id).populate("owner", 'username fullName avatar');
    if(!finalPost) throw new ApiError(500, "Server Error");

    return res
    .status(200)
    .json((new ApiResponse(200, finalPost, "Post uploaded successfully!")));

})

const getPostById = asyncHandler(async (req, res) =>{
    const { postId } = req.params;

    if(!postId || !mongoose.isValidObjectId(postId)){
        throw new ApiError(400, "Not a valid id")
    }
    const post = await Post.findById(postId).populate('owner', 'username avatar fullName');

    if(!post) throw new ApiError(404, "Post not found!");

    return res
    .status(200)
    .json(new ApiResponse(200, post, "Post fetched successfully!"));
});

const deletePost = asyncHandler(async (req, res)=>{
    const { postId } = req.params;

    if(!postId || !mongoose.isValidObjectId(postId)){
        throw new ApiError(400, "Not a valid id")
    }

    const post = await Post.findById(postId);

    if(!post) throw new ApiError(404, "Post not found!");

    if(!post.owner.equals(req.user._id)) throw new ApiError(401, "Unauthorized request");

    if(post.image){
        const deleteImage = await deleteFromCloudinary(post.image);
        if(!deleteImage) throw new ApiError(500, "Post was not deleted due to server error");
    }

    const deletedPost = await Post.deleteOne({ _id: postId});

    if(!deletedPost) throw new ApiError(500, "There was some server error while deleting the post");

    return res
    .status(200)
    .json(new ApiResponse(200, post, "Post deleted successfully!"));
})

const getUserPosts = asyncHandler(async (req, res)=> {
    const {userId} = req.params;

    if(!userId || !mongoose.isValidObjectId(userId)){
        throw new ApiError(400, "Not a valid id")
    }

    const userPosts = await Post.find({owner: userId});
    if(!userPosts) throw new ApiError(404, "Post not found!");
    console.log(userPosts);

    return res
    .status(200)
    .json(new ApiResponse(200, userPosts, "All posts of user fetched successfully!"));
})

const editPost = asyncHandler(async (req, res) =>{
    const { postId } = req.params;
    const { content, link } = req.body;
    const removeImage = req.body.removeImage === 'true';

    if(!postId || !mongoose.isValidObjectId(postId)){
        throw new ApiError(400, "Not a valid id")
    }

    const post = await Post.findById(postId);
    if(!post) throw new ApiError(404, "Post not found!");

    if(!post.owner.equals(req.user._id)) throw new ApiError(401, "Unauthorized request");

    // Handle image update
    let newImageUrl = post.image;
    const imageLocalPath = req.files?.image?.[0]?.path;
    if (imageLocalPath) {
        // Delete old image if exists
        if (post.image) {
            const deleteImage = await deleteFromCloudinary(post.image);
            if (!deleteImage) throw new ApiError(500, "Old image was not deleted due to server error");
        }
        const image = await uploadOnCloudinary(imageLocalPath);
        if (!image) throw new ApiError(500, "Error while uploading the new image on our servers");
        newImageUrl = image.url;
    } else if (removeImage && post.image) {
        // Remove image if requested and no new image is uploaded
        const deleteImage = await deleteFromCloudinary(post.image);
        if (!deleteImage) throw new ApiError(500, "Old image was not deleted due to server error");
        newImageUrl = "";
    }

    // Update fields
    post.content = content !== undefined ? content : post.content;
    post.link = link !== undefined ? link : post.link;
    post.image = newImageUrl;

    await post.save();
    const updatedPost = await Post.findById(post._id).populate("owner", 'username fullName avatar');

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPost, "Post updated successfully!"));
});

export { uploadPost, getPostById, deletePost, getUserPosts, editPost };