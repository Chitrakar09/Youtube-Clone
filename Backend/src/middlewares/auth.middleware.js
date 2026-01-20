import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJwt = asyncHandler(async (req, _, next) => { // unused parameter can be replaced with _. Here res replaced with _ 
 try {
     //get the access token
     const accessToken =
       req.cookies?.accessToken ||
       req.header("Authorization")?.replace("Bearer ", "");
   
     if (!accessToken) throw new apiError(401, "Unauthorized request");
   
     // verify the token. gives you decoded information
     const decodedInformation = jwt.verify(
       accessToken,
       process.env.ACCESS_TOKEN_SECRET
     );
   
     // get the user information from db
     const user = await User.findById(decodedInformation?._id).select(
       "-password -refreshToken"
     );
   
     if (!user) throw new apiError(401, "Invalid Access Token");
   
     // send the user information with the request
     req.user = user;
   
     next();
 } catch (error) {
    throw new apiError(401,error?.message || "Invalid access token")
 }
});
