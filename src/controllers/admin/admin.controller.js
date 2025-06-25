import { asyncHandler } from "../../utils/asyncHandler.js";
import { Admin } from "../../models/admin.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

const generateAdminAccessToken = async (adminId) => {
    try{
        const admin = await Admin.findById(adminId);
    
        if(!admin) throw new ApiError(404, "Admin not found");
        
        const accessToken = admin.generateAccessToken();

        return { accessToken }
    }
    catch(error){
        throw new ApiError(500, "Something went wrong while generating the tokens.")
    }
}
const registerAdmin = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) throw new ApiError(400, "Username and password are required");

    const admin = await Admin.findOne({ username });
    
    if (admin) throw new ApiError(400, "Admin already exists");

    const newAdmin = await Admin.create({ username, password });
    
    return res
    .status(200)
    .json(new ApiResponse(200, newAdmin, "Admin created successfully!"));
});

const loginAdmin = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });

    if (!admin) throw new ApiError(404, "Admin does not exist");

    const isPasswordCorrect = await admin.isPasswordCorrect(password);

    if (!isPasswordCorrect) throw new ApiError(400, "Incorrect username or password");

    const {accessToken} = await generateAdminAccessToken(admin._id);

    const finalAdmin = await Admin.findOne({username}).select("-password");

    const options = {
        httpOnly: true,
        secure: true 
    }
    
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .json(new ApiResponse(200, {accessToken, admin: finalAdmin}, "Admin logged in successfully!"));

});

const updatePassword = asyncHandler(async (req, res) => {
    const {username, newPassword, currentPassword } = req.body;

    if (!newPassword || !currentPassword) {
        throw new ApiError(400, "All fields are required");
    };

    const admin = await Admin.findOne({ username });

    if (!admin) throw new ApiError(404, "Admin does not exist");

    const isPasswordCorrect = await admin.isPasswordCorrect(currentPassword);

    if (!isPasswordCorrect) throw new ApiError(400, "Incorrect password");

    admin.password = newPassword;
    await admin.save({validateBeforeSave: false});

    return res
    .status(200)
    .json(new ApiResponse(200, admin, "Password updated successfully!"));
});

export { registerAdmin, loginAdmin, updatePassword };