import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async (userId) => {

    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken(); //we don't need 'await' here since the method acts synchronously
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken; //setting the refreshToken to currently generated refreshToken

        await user.save({ validateBeforeSave: false });
        //saving the changes made in 'refreshToken' in the database. Here we are setting 'validateBeforeSave' to false to surpass any validations (such as 'required'), if there are any on the fields which are modified ('refreshToken' in this case). It's not really needed here, but it's just to demonstrate what is 'validateBeforeSave'.
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating the tokens.")
    }

}

const registerUser = asyncHandler(async (req, res, next) => {
    const { fullName, email, username, password } = req.body;

    //Checking if all the required fields are sent and are not empty strings and throwing error otherwise.
    if (
        [fullName, email, username, password].some((field) => !field || field.trim() === "")
    ) {
        throw new ApiError(400, "All the fields are required");
    }

    //Checking if the database already contains some user with this username or email (i.e. user already exists) and throwing error if that is true.
    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    });
    if (existingUser) {
        throw new ApiError(409, "User already exists");
    }

    //Getting the path of the files in variables if they are successfully uploaded. If they're not successfully uploaded, we'll get 'undefined' stored in the variables. 
    const avatarLocalPath = req.files?.avatar?.[0].path;

    // const coverImageLocalPath = req.files?.coverImage?.[0].path;
    // the above commented code also works correctly but we are using the following alternative for now

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }


    //throwing error if 'avatar' is not provided 
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath); //here if coverImageLocalPath is 'undefined' then the function would return 'null' value, which is later being handled while creating databse entry

    if (!avatar) {
        throw new ApiError(500, "Server error!");
    }

    //creating entry in the database
    const userEntry = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "", //setting coverImage's value to empty string in case, it's value is 'null'.
        email,
        password,
        username: username.toLowerCase()
    });

    const createdUser = await User.findById(userEntry._id).select(
        "-password -refreshToken"
    )//removing password nad refreshtoken from the response

    //checking if the user's entry has successfully been created in the database.
    if (!createdUser) {
        throw new ApiError(500, "Server error!");
    }

    //sending the response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully!")
    )

});

const loginUser = asyncHandler(async (req, res, next) => {

    const { email, username, password } = req.body;

    //checking if at least one of the detail (username or email) is provided.
    if (!username && !email) {
        throw new ApiError(400, "Username or Email is required!")
    }

    //finding the user with given email/username
    const user = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    //checking if the password entered by the user is correct or not
    const passwordCheck = await user.isPasswordCorrect(password);

    if (!passwordCheck) {
        throw new ApiError(401, "Incorrect password!");
    }

    if(!user.status){
        throw new ApiError(401, "Your account is currently inactive!");
    }

    // generating access and refresh tokens after successful password validation.
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    // retrieving the data of the user (excluding password and refreshToken) which is to be sent in response 
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    //the following object is passed as parameter in res.cookie()
    const options = {
        httpOnly: true, //Ensures the cookie is only accessible via HTTP(S) requests and not accessible to client-side JavaScript.
        secure: true //Ensures the cookie is only sent over secure HTTPS connections.
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options) //sending accessToken as a cookie
        .cookie("refreshToken", refreshToken, options) //sending refreshToken as a cookie
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken, refreshToken }
                //explicitly sending accessToken and refreshToken in the response in case user wants to store them locally
                ,
                "User has logged in!"
            )
        )
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            }
        },
        {
            new: true,
        }
    );
    //here we are updating the refresh token field from the user who has requested to logout to 'undefined' (basically removing it). Note that here we have the access of req.user since we have used the 'verifyJWT' middleware (refer user.route.js) which would act just before the logout functionality to get the authorized user whose access token and refresh token must be removed.
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options) //deleting the "accessToken" from cookies
        .clearCookie("refreshToken", options)//deleting the "refreshToken" from cookies
        .json(new ApiResponse(200, {}, "User logged out!"));
})

const updateUserFullName = asyncHandler(async (req, res) => {
    // 1 middleware (auth) will act before this function to get access of req.user
    const { fullName } = req.body;

    if (!fullName) {
        throw new ApiError(400, "fullName is required")
    }

    const user = await User.findByIdAndUpdate(req.user._id, {
        $set: {
            fullName
        },
    },
        { new: true }).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Full name is updated successfully"))
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    // 2 middlewares (multer and auth) will act before this function to get access of req.file and req.user
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar || !avatar.url) {
        throw new ApiError(500, "Internal sever error while uploading process");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar: avatar?.url
            }
        },
    ).select("-password -refreshToken");

    if(!user) throw new ApiError(401, "Unauthorized request!")
    
    const deleteOriginalAvatar = await deleteFromCloudinary(user?.avatar);

    if(!deleteOriginalAvatar){
        throw new ApiError(500, "Something went wrong while deleting previous avatar");
    }
    console.log(deleteOriginalAvatar);

    user.avatar = avatar?.url;

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User's avatar updated successfully"));
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    //same logic as updateUserAvatar
    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image is required");
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!coverImage || !coverImage.url) {
        throw new ApiError(500, "Internal sever error while uploading process");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                coverImage: coverImage?.url
            }
        },
    ).select("-password -refreshToken");

    if(!user) throw new ApiError(401, "Unauthorized request!")
    
    const deleteOriginalCoverImage = await deleteFromCloudinary(user?.coverImage);

    if(!deleteOriginalCoverImage){
        throw new ApiError(500, "Something went wrong while deleting previous avatar");
    }
    console.log(deleteOriginalCoverImage);

    user.coverImage = coverImage?.url;

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User's cover image has been updated successfully"));
})

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;
    //req.params refer to the route parameters. These parameters are part of the URL and are used to capture values dynamically

    if (!username) {
        throw new ApiError(401, "User does not exist");
    }// throwing error if we get no username from req.params


    const channel = await User.aggregate([
        {
            //first stage
            $match: { username: username?.toLowerCase() }
            //matching the document in the database which has the username same as the username taken from req.params and passing that document to the next stage. Since usernames are unique only a single document will be passed to the next stage.
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscribedUser",
                as: "subscribers"
            }
            //storing an array of all the documents which are contained by 'subscriptions' and whose channel field matches with the _id of local field (the document passed by previous stage) into a new field ('subscribers') in the current document.
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
            //similar to previous one, this time we look for matching 'subscriber' and save all documents as array in 'subscribedTo'.
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers" //gives the length of the array (to find no. of subscribers) saved in 'subscribers' field of current document.
                },
                subscribedToCount: {
                    $size: "$subscribedTo" //gives the length of the array saved in 'subscribedTo' (to find n. of subscriptions) field of current document.
                },
                isSubscribed: {
                    $cond: {
                        if: {
                            $in: [req.user._id, "$subscribers.subscriber"]
                        },
                        then: true,
                        else: false
                    }
                    //if the user who has requested the channel's profile details (which we get from req.user._id) is being checked if he is present in the 'subscribers' list of the user who's profile details are being requested. If that is 'true' we save true in a new field 'isSubscribed' otherwise we save false.
                }
            }
        },
        {
            $project: {
                fullName: 1,
                subscribersCount: 1,
                subscribedToCount: 1,
                isSubscribed: 1,
                username: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
                referralPoints: 1
            }
            //sets the values which are to be returned as object into 'channel' variable. All the fields which are set to 1 in $project will be returned in the 'channel' variable together as an object.
        }
    ])

    if (!channel?.length) {
        throw new ApiError(404, "Channel does not exist!");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, channel[0], "User channel details successfully fetched"))
})



export { registerUser, loginUser, logoutUser, updateUserFullName, updateUserAvatar, updateUserCoverImage, getUserChannelProfile }
