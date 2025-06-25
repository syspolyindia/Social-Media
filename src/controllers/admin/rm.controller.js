import { asyncHandler } from "../../utils/asyncHandler.js";
import { Referral } from "../../models/referral.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { getReferralValue, setReferralValue } from "../../config/referralConfig.js";

const fetchAllReferrals = asyncHandler(async (req, res) => {
    const referrals = await Referral.find()
    .populate('referredUser', 'username')
    .populate('referredTo', 'username')
    .populate('referredBy', 'username');

    if (!referrals) throw new ApiError(404, "No referrals found for this user");

    referrals.forEach((referral)=>{
        referral.date = referral.createdAt.toLocaleDateString();
    });

    return res
    .status(200)
    .json(new ApiResponse(200, referrals, "Referrals fetched successfully"));
});

const fetchReferralValue = asyncHandler(async (req, res) => {
    const referralValue = getReferralValue();
    return res
        .status(200)
        .json(new ApiResponse(200, { referralValue }, "Referral value fetched successfully"));
});

const updateReferralValue = asyncHandler(async (req, res) => {
    const { value } = req.body;
    if (value === undefined || value === null) {
        throw new ApiError(400, "Referral value is required");
    }

    if (typeof value !== 'number' || !Number.isInteger(value)) {
        throw new ApiError(400, "Referral value must be an integer");
    }

    setReferralValue(value);
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Referral value updated successfully"));
});


export {fetchAllReferrals, fetchReferralValue, updateReferralValue};