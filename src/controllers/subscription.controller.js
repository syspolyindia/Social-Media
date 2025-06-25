import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const toggleSubscription = asyncHandler(async (req, res) => {
    const {userId} = req.params

    if(!userId || !mongoose.isValidObjectId(userId)) throw new ApiError(404, "User not found");

    const user = await User.findById(userId);
    if(!user) throw new ApiError(404, "User does not exist");

    if(req.user._id.equals(userId)) throw new ApiError(400, "User can not subscribe himself/herself");

    const aggregationPipeline = [
        { 
            $match: {
                subscribedUser: new mongoose.Types.ObjectId(userId),
                subscriber: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from: 'users',
                localField: 'subscribedUser',
                foreignField: '_id',
                as: 'subscribedUser',
                pipeline: [
                    {
                        $project:{
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                subscribedUser: { $first: '$subscribedUser'}
            }
        }
    ]

    const subscription = await Subscription.aggregate(aggregationPipeline);

    if(!subscription.length){
        const createSubscription = await Subscription.create({
            subscribedUser: new mongoose.Types.ObjectId(userId),
            subscriber: new mongoose.Types.ObjectId(req.user._id)
        });

        if(!createSubscription) throw new ApiError(500, "Some error occured while trying to subscribe");

        const finalSubscription = await Subscription.aggregate(aggregationPipeline);
        if(!finalSubscription) throw new ApiError(500, "Internal server Error");

        return res.status(200).json(new ApiResponse(200, finalSubscription[0], "User has been subscribed successfully!"));
    }
    else{
        const deleteSubscription = await Subscription.deleteOne({
            subscribedUser  : userId,
            subscriber: req.user._id
        });
        if(!deleteSubscription.deletedCount) throw new ApiError(500, "Some error occured while trying to unsubscribe");
        return res.status(200).json(new ApiResponse(200, subscription, "User has been unsubscribed successfully!"));
    }
});

const checkSubscription = asyncHandler(async (req, res)=>{
    const {userId} = req.params;

    if(!userId || !mongoose.isValidObjectId(userId)) throw new ApiError(404, "User not found");

    const subscription = await Subscription.findOne({subscribedUser: userId, subscriber: req.user._id});

    if(!subscription){
        return res
        .status(200)
        .json(new ApiResponse(200, { subscription:false}, "You are not subscribed to this user"));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { subscription:true}, "You are subscribed to this user"));
})

const getSubscribedUsers = asyncHandler(async (req, res)=>{

    const subscriptions = await Subscription.find({subscriber: req.user._id}).populate("subscribedUser", "username fullName avatar");

    return res
    .status(200)
    .json(new ApiResponse(200, subscriptions, "Subscribed users fetched successfully"));
})
  
export {toggleSubscription, checkSubscription, getSubscribedUsers};