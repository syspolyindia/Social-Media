import { User } from "../../models/user.model.js";
import { Referral } from "../../models/referral.model.js";
import { Comment } from "../../models/comment.model.js";
import { Subscription } from "../../models/subscription.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { Post } from "../../models/post.model.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

const getDashboardInfo = asyncHandler(async (req, res) => {
    const totalPosts = await Post.countDocuments();
    const activeUsers = await User.countDocuments({status: true});
    const inactiveUsers = await User.countDocuments({status: false});
    const acceptedReferrals = await Referral.countDocuments({status: true});
    const pendingReferrals = await Referral.countDocuments({status: false});
    const totalComments = await Comment.countDocuments();
    const totalSubscriptions = await Subscription.countDocuments();
    return res
    .status(200)
    .json(new ApiResponse(200, {
        postCount: totalPosts,
        activeUserCount : activeUsers,
        inactiveUserCount: inactiveUsers,
        acceptedReferralCount: acceptedReferrals,
        pendingReferralCount: pendingReferrals,
        commentCount: totalComments,
        subscriptionCount: totalSubscriptions
    }, "Total posts fetched successfully!"));
})

export {getDashboardInfo};