import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { Subscription } from "../../models/subscription.model.js";
import { ApiError } from "../../utils/ApiError.js";


const fetchAllSubscriptions = asyncHandler(async (req, res) => {
    const subscriptions = await Subscription.find()
    .populate("subscriber", "username avatar fullName")
    .populate("subscribedUser", "username avatar fullName");

    if(!subscriptions) throw new ApiError(404, "Subscriptions not found!");

    subscriptions.forEach((subscription)=>{
        subscription.date = subscription.createdAt.toLocaleDateString();
    });

    return res
    .status(200)
    .json(new ApiResponse(200, subscriptions, "Subscriptions fetched successfully!"));
})

export {fetchAllSubscriptions};