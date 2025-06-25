import { Referral } from '../models/referral.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import mongoose from 'mongoose';
import { User } from '../models/user.model.js';
import { Subscription } from '../models/subscription.model.js';
import { getReferralValue, setReferralValue } from '../config/referralConfig.js';

const createReferral = asyncHandler(async (req, res) => {
    const { referredUserUsername, referredToUsername } = req.body;
    console.log(referredUserUsername);
    console.log(referredToUsername);

    const referredUser = await User.findOne({ username: referredUserUsername });
    if (!referredUser) throw new ApiError(404, "The user being referred was not found");

    const referredTo = await User.findOne({ username: referredToUsername });
    if (!referredTo) throw new ApiError(404, "The user with whom referral was being shared was not found!");

    const subscriptionExistence = await Subscription.findOne({
        subscribedUser: new mongoose.Types.ObjectId(referredUser._id),
        subscriber: new mongoose.Types.ObjectId(referredTo._id)
    });

    if (subscriptionExistence) throw new ApiError(400, "Subscription already exists or has already been made");

    const referralExistence = await Referral.findOne({
        referredBy: new mongoose.Types.ObjectId(req.user._id),
        referredUser: new mongoose.Types.ObjectId(referredUser._id),
        referredTo: new mongoose.Types.ObjectId(referredTo._id)
    });

    if (referralExistence) throw new ApiError(400, "Referral already exists or has already been made");

    const referral = await Referral.create({
        referredBy: new mongoose.Types.ObjectId(req.user._id),
        referredUser: new mongoose.Types.ObjectId(referredUser._id),
        referredTo: new mongoose.Types.ObjectId(referredTo._id)
    });

    if (!referral) throw new ApiError(500, "Server error while saving the document");

    const finalReferral = await Referral.findById(referral._id)
        .populate('referredUser', 'username fullName avatar')
        .populate('referredTo', 'username fullName avatar');

    return res
        .status(200)
        .json(new ApiResponse(200, finalReferral, "Referral has been created successfully"));
})

const getOwnReferrals = asyncHandler(async (req, res) => {
    const referrals = await Referral.find({
        referredTo: req.user._id,
        status: false
    })
        .populate("referredUser", "username fullName avatar")
        .populate("referredBy", "username");

    if (!referrals) throw new ApiError(404, "No referrals found for this user");

    return res
        .status(200)
        .json(new ApiResponse(200, referrals, "Referrals fetched successfully"));
})

const acceptReferral = asyncHandler(async (req, res) => {
    const { referralId } = req.params;

    if (!referralId || !mongoose.isValidObjectId(referralId)) {
        throw new ApiError(400, "Not a valid id")
    }

    const referral = await Referral.findOne({ _id: referralId, referredTo: req.user._id });

    if (!referral) throw new ApiError(404, "Referral does not exist or unauthorized access");
    if(referral.status) throw new ApiError(400, "Referral already accepted");

    const checkSubscription = await Subscription. findOne({
        subscribedUser: new mongoose.Types.ObjectId(referral.referredUser),
        subscriber: new mongoose.Types.ObjectId(referral.referredTo)
    })

    if (checkSubscription){
        const deleteReferral = await Referral.deleteOne({
            _id: referralId,
        })

        if(!deleteReferral) throw new ApiError(500, "Server error while accepting the referral");

        referral.alreadySubscribed = true;

        return res
        .status(200)
        .json(new ApiResponse(200, referral, `Referral already accepted and Subscribed to @${referral.referredUser}`));
    }

    
    const createSubscription = await Subscription.create({
        subscribedUser: new mongoose.Types.ObjectId(referral.referredUser),
        subscriber: new mongoose.Types.ObjectId(referral.referredTo)
    });
    
    if(!createSubscription) throw new ApiError(500, "Server error while accepting the referral");
    
    referral.status = true;

    const referralValue = getReferralValue();
    
    const referredBy = await User.findOneAndUpdate(
        { _id: referral.referredBy },
        {
            $inc: {
                referralPoints: referralValue
            }
        },
        { new: true, runValidators: true }
    );
    
    if (!referredBy) throw new ApiError(500, "Server Error");
    
    await referral.save({ validateBeforeSave: false });
    
    referral.alreadySubscribed = false;
    
    return res
        .status(200)
        .json(new ApiResponse(200, referral, `Referral accepted and Subscribed to @${referral.referredUser}`));
});


const rejectReferral = asyncHandler(async (req, res) => {
    const { referralId } = req.params;

    if (!referralId || !mongoose.isValidObjectId(referralId)) {
        throw new ApiError(400, "Not a valid id")
    }

    const referral = await Referral.findOne({ _id: referralId, referredTo: req.user._id });

    if(!referral) throw new ApiError(404, "Referral does not exist or unauthorized access");

    if(referral.status) throw new ApiError(400, "Referral has already been accepted");

    const deleteReferral = await Referral.deleteOne({
        _id: referralId,
    });

    if (!deleteReferral) throw new ApiError(500, "Server error while rejecting the referral");

    return res
        .status(200)
        .json(new ApiResponse(200, deleteReferral, "Referral rejected successfully"));

});



export { createReferral, getOwnReferrals, acceptReferral, rejectReferral}