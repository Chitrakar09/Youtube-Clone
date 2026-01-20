import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import fs from "fs"; // used for file handling
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

//generating refresh and access token

const generateRefreshAndAccessToken = async (userId) => {
  try {
    // get the user
    const user = await User.findById(userId);

    // generate refresh and access token using custom methods in user model
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    

    // update the refresh token
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // return the access and refresh token
    return { accessToken, refreshToken };
  } catch (error) {
    throw new apiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

// registering user
const registerUser = asyncHandler(async (req, res) => {
  // Steps to follow:
  // get the data => done
  // check if all the data needed are available => done
  // check if the user already exists: username, email => done
  // get avatar and cover image => done
  // check if there is avatar => done
  // send the avatar and cover image to cloudinary => done
  // check if avatar and cover image properly updated => done
  // send the data to the db, create user object => done
  // check for user creation/response => done
  // send the response without password and refresh token to the front end

  // get the data
  const { fullName, username, email, password } = req.body; // can be sent using form data in postman because multer populates req.file and req.body. express does not have inbuilt parser to parse form data but here multer does it.

  // get avatar and cover image
  const avatarLocalFilePath = req.files?.avatar?.[0]?.path;
  const coverImageLocalFilePath = req.files?.coverImage?.[0]?.path;

  // check if all the data needed are available
  if (
    [fullName, username, email, password].some(
      (field) => !field || field?.trim() === "" // if even one field is "", returns true else false
    )
  ) {
    fs.unlinkSync(avatarLocalFilePath);
    fs.unlinkSync(coverImageLocalFilePath);
    throw new apiError(400, "Please fill all the required details");
  }

  // check if user already exists
  const hasUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (hasUser) {
    fs.unlinkSync(avatarLocalFilePath);
    fs.unlinkSync(coverImageLocalFilePath);
    throw new apiError(409, "User Already exists");
  }

  // check if there is avatar
  if (!avatarLocalFilePath) throw new apiError(400, "Must have Avatar");

  // send avatar and coverImage to cloudinary
  const avatarOnCloud = await uploadOnCloudinary(avatarLocalFilePath);
  // check if avatar properly uploaded
  if (!avatarOnCloud) throw new apiError(500, "Could not upload avatar");

  let coverImageOnCloud = await uploadOnCloudinary(coverImageLocalFilePath);
  // check if coverImage is properly uploaded
  if (!coverImageOnCloud) coverImageOnCloud = null;

  // send the data to the database
  const user = await User.create({
    fullName,
    username: username.toLowerCase(),
    email,
    password,
    avatar: avatarOnCloud.url,
    coverImage: coverImageOnCloud?.url || "",
  });

  // check for user creation/ response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser)
    throw new apiError(500, "Something went wrong while registering");

  return res
    .status(201)
    .json(
      new apiResponse(
        200,
        createdUser,
        coverImageOnCloud
          ? "User successfully Registered"
          : "User successfully Registered without cover image"
      )
    );
});

// logging in user

const loginUser = asyncHandler(async (req, res) => {
  // steps to follow
  // get the data
  // check if there is data
  // check if there is user
  // if there is user, check the password
  // if password is correct, get and send refresh and access token to db
  // return response having user details (-password and refresh token) along with refresh and access token in cookies

  try {
    // get the data
    const { username, email, password } = req.body; // cannot be sent using form data in postman because we don't have a middleware to parse form data. so only json data can be sent as we have json parser

    // check if there is data
    if (!(username || email))
      throw new apiError(400, "Provide username or email");

    // check if there is user
    const user = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (!user) throw new apiError(400, "User doesn't exit");

    // check the password
    const isUser = await user.isPasswordCorrect(password);

    if (!isUser) throw new apiError(400, "Password incorrect");

    //send refresh and access token
    const { accessToken, refreshToken } = await generateRefreshAndAccessToken(
      user._id
    );

    // return response having user details (-password and refresh token) along with refresh and access token in cookies

    //get user data without password and refresh token
    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    // set configuration for cookies
    const options = {
      httpOnly: true,
      secured: true,
    };

    //return
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new apiResponse(
          200,
          { user: loggedInUser, accessToken, refreshToken },
          "Successfully LoggedIn"
        )
      );
  } catch (error) {
    throw new apiError(500, error?.message || "Something went wrong");
  }
});

//logout user
const logoutUser = asyncHandler(async (req, res) => {
  // get the user
  // update the refreshToken to undefined
  // clear the cookies

  //get the user
  const userId = req.user._id;

  // update the refreshToken to undefined
  const refreshTokenUpdates = await User.findByIdAndUpdate(
    userId,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
      runValidators: false,
    }
  );
  
  if (!refreshTokenUpdates)
    console.error("could not update refreshToken in db");
  //clear the cookies
  const options = {
    httpOnly: true,
    secured: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, {}, "Successfully logged out"));
});

//refresh Access token
const refreshAccessToken = asyncHandler(async (req, res) => {
  //get the refreshToken from the cookies
  //check if the refreshToken is still valid/is not expired,
  //get the user
  //check if refreshToken matches with one in the db
  //if valid then assign a new accessToken and refresh token

  try {
    // get the refresh token from cookies
    const incomingRefreshToken = req.cookies.refreshToken;

    if (!incomingRefreshToken) throw new apiError(401, "Unauthorized request");

    //check if request token is still valid/is not expired
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    ); // checks for expiry here

    // get the user
    const user = await User.findById(decodedToken?._id);

    if (!user) throw new apiError(401, "Invalid refresh token");

    //check if refreshToken matches with one in the db
    if (incomingRefreshToken !== user?.refreshToken)
      throw new apiError(401, "Refresh token is expired or used"); // checks if old refreshToken is used

    //assign a new access token and refresh token
    const { accessToken, refreshToken } = await generateRefreshAndAccessToken(user._id);
      

    const options = {
      httpOnly: true,
      secured: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new apiResponse(
          200,
          { accessToken, refreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new apiError(400, error?.message || "Invalid refresh token");
  }
});

// change password
const changePassword = asyncHandler(async (req, res) => {
  // get the user => done
  // verify the user => done
  // get the old and new password => done
  // check if the old password sent and the password in the db are same => done
  // if same update the password
  // return the response

  try {
    //get the user
    const user = await User.findById(req.user?._id);

    // verify the user
    if (!user) throw new apiError(401, "Unauthorized Access");

    //get the old and new password
    const { oldPassword, newPassword } = req.body;

    if (!(oldPassword && newPassword))
      throw new apiError(400, "All fields are required");

    // check if the old password sent and the password in the db are same
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) throw new apiError(400, "Invalid old password");

    // update the password
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    // return the response
    return res
      .status(200)
      .json(new apiResponse(200, {}, "Password changed successfully"));
  } catch (error) {
    throw new apiError(
      error?.statusCode || 500,
      error?.message || "Internal server error"
    );
  }
});

// get the current user
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new apiResponse(200, req.user, "User fetched successfully"));
});

// update full name
const updateFullName = asyncHandler(async (req, res) => {
  // get the new full name
  // get the user
  // update the full name
  // return the response

  try {
    // get the new fullName
    const { newFullName } = req.body;
    if (!newFullName) throw new apiError(400, "Field is empty");

    // get the user and update the fullName
    const updatedUser = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: { fullName: newFullName },
      },
      { new: true }
    ).select("-password -refreshToken");

    if (!updatedUser) throw new apiError(500, "Could not update full name");

    //return the response
    return res
      .status(200)
      .json(new apiResponse(200, updatedUser, "Full Name updated"));
  } catch (error) {
    throw new apiError(
      error?.statusCode || 500,
      error?.message || "Internal server error"
    );
  }
});

// update avatar
const updateAvatar = asyncHandler(async (req, res) => {
  // get the user => done
  // get the new avatar file => done
  // get the old avatar => done
  // upload new avatar on cloudinary => done
  // update in db => done
  // delete the old avatar in cloudinary =>done
  // return the response => done

  try {
    // get the user
    const user = await User.findById(req.user?._id);
    if (!user) throw new apiError(401, "unauthorized access");

    // get the file
    const newAvatarLocalFilePath = req.file?.path;
    // check if there is newAvatar sent
    if (!newAvatarLocalFilePath) throw new apiError(400, "Avatar is required");

    // get the old avatar
    const oldAvatar = user.avatar;

    // upload new avatar on cloudinary
    const newAvatarCloudinaryUrl = await uploadOnCloudinary(
      newAvatarLocalFilePath
    );
    

    if (!newAvatarCloudinaryUrl)
      throw new apiError(500, "Could not upload avatar in cloudinary");

    
    // update in db
    const updatedUser = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          avatar: newAvatarCloudinaryUrl.url,
        },
      },
      { new: true }
    ).select("-password -refreshToken");
    
    // delete the old avatar in cloudinary
    const deletedOnCloudinary = await deleteOnCloudinary(oldAvatar);
    

    if (!deletedOnCloudinary)
      console.error("Couldn't delete coverImage in cloudinary");

    return res
      .status(200)
      .json(new apiResponse(200, updatedUser, "Avatar updated"));
  } catch (error) {
    throw new apiError(
      error?.statusCode || 500,
      error?.message || "Internal server error"
    );
  }
});

// update coverImage
const updateCoverImage = asyncHandler(async (req, res) => {
  // get the user => done
  // get the new coverImage file => done
  // get the old coverImage => done
  // upload new coverImage on cloudinary => done
  // update in db => done
  // delete the old coverImage in cloudinary =>done
  // return the response => done

  try {
    // get the user
    const user = await User.findById(req.user?._id);
    if (!user) throw new apiError(401, "unauthorized access");

    // get the file
    const newCoverImageLocalFilePath = req.file?.path;
    // check if there is newAvatar sent
    if (!newCoverImageLocalFilePath)
      throw new apiError(400, "Cover Image is required");

    // get the old avatar
    const oldCoverImage = user.coverImage;

    // upload new avatar on cloudinary
    const newCoverImageCloudinaryUrl = await uploadOnCloudinary(
      newCoverImageLocalFilePath
    );

    if (!newCoverImageCloudinaryUrl)
      throw new apiError(500, "Could not upload image in cloudinary");

    
    // update in db
    const updatedUser = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          coverImage: newCoverImageCloudinaryUrl.url,
        },
      },
      { new: true }
    ).select("-password -refreshToken");
    
    // delete the old avatar in cloudinary
    const deletedOnCloudinary = await deleteOnCloudinary(oldCoverImage);

    if (!deletedOnCloudinary)
      console.error("Couldn't delete coverImage in cloudinary");

    return res
      .status(200)
      .json(
        new apiResponse(
          200,
          updatedUser,
          deletedOnCloudinary
            ? "Cover Image updated"
            : "Cover Image updated, couldn't delete in cloudinary"
        )
      );
  } catch (error) {
    throw new apiError(
      error?.statusCode || 500,
      error?.message || "Internal server error"
    );
  }
});

// get user channel profile
const getChannelProfile = asyncHandler(async (req, res) => {
  // get the username =>done
  // write aggregation pipeline =>done
  // return the response =>done

  /* Logic

    # in subscription model, subscriber has different _id and channel has different _id and combination of those two is a new document object
    # there are multiple document object of subscription schema
    # we reference from Subscription model not user model
    # user model is just to get the _id of the username 

      1. to get the number of Subscribers
          * you get the number of subscribers by getting no of documents having the channel.
          * by searching for the channel in the document, you get the list of document having that channel
          * that means there are that many number of subscribers 

      2. to get the number of channels subscribed
          * you get the number of channels subscribed by getting no of documents having the user
          * by searching for the user in the document, you get the number of different channels you have subscribed to
          * that means, no of users gotten= no of channels
      
      3. to check if subscribed or not:
          * we get the subscribers fields from step 1. 
          * in there we check if the current user(from req.user) is there or not
  */

  /* aggregation pipeline:
    1. get the user
    2. getting no.of subscribers
    3. getting no of subscribed channels
    4. add the subscribers count and subscribedTo count into the user
    5. check if the user is subscribed
    6. send only the required fields
  */

  try {
    // get the username
    const { username } = req.params;

    if (!username?.trim()) throw new apiError(400, "Username is missing");

    // write aggregation pipeline
    const channelInfo = await User.aggregate([
      // get the user
      {
        // $match is just model.findById(). used to get the _id of the username
        $match: {
          username: username?.toLowerCase(),
        },
      },
      // getting no. of subscribers
      {
        // $lookup allows you to combine documents from two collections based on a shared field (a foreign key relationship).
        $lookup: {
          from: "subscriptions",
          localField: "_id", // id of the channel
          foreignField: "channel",
          as: "subscribers",
        },
      },
      // getting no. of subscribed channels
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id", // id of the channel
          foreignField: "subscriber",
          as: "subscribedTo",
        },
      },
      // add the subscribers count and subscribedTo count into the user
      {
        $addFields: {
          // adds the fields to the user
          subscriberCount: {
            $size: "$subscribers",
          },
          subscribedToCount: {
            $size: "$subscribedTo",
          },
          // check if the user is subscribed
          isSubscribed: {
            $cond: {
              // used for conditions
              if: { $in: [req.user?._id, "$subscribers.subscriber"] },
              then: true,
              else: false,
            },
          },
        },
      },
      // send only the required fields
      {
        $project: {
          // used to send only the required fields. 1 is to send the field
          fullname: 1,
          username: 1,
          avatar: 1,
          coverImage: 1,
          subscriberCount: 1,
          subscribedToCount: 1,
          isSubscribed: 1,
        },
      },
    ]);

    if (!channelInfo?.length)
      throw new apiError(500, "Could not get the information");

    return res
      .status(200)
      .json(
        new apiResponse(
          200,
          channelInfo[0],
          "Successfully retrieved channel info"
        )
      );
  } catch (error) {
    throw new apiError(
      error?.statusCode || 500,
      error?.message || "Internal server error"
    );
  }
});

// get watchHistory
const getWatchHistory = asyncHandler(async (req, res) => {
  // get user from request => done
  // write the aggregation pipeline => done
  // return the result => done

  /* logic:
      you already have an array of video Id (you add the video Id from another controller when you click on the video). you connect the video model and then look for the videos with the video Id in the watchHistory.

      in the video object, you only have the id of the uploader (video owner), but not the owner info so you have a sub pipeline to add the details of the uploader as well
  */

  /* aggregation pipeline:
   * match the user you need
   * lookup the video information from video model using the id in the watchHistory field of the user model
   * write a sub pipeline to get the owner details by lookup between video model and user model. you have the owner field in the video model (local) and _id in the user field (foreign).
   * get only the avatar, fullname and username
   * add the field to the watch History
   */

  const user = await User.aggregate([
    {
      // get the user
      $match: {
        _id: new mongoose.Types.ObjectId(req.user?._id), // because in mongodb, _id is stored as object and to req.user._id is a string. To compare the two user _id (from req.user._id and the id in the db stored as object), we do it like this.
      },
    },
    {
      $lookup: {
        // connect the video model and get the video information
        from: "videos",
        localField: "watchedHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          // sub pipeline to get information of the video owner/ uploader / channel
          {
            $lookup: {
              from: "users", // currently you are in video model
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                // get only the required fields
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          // add the owner field along with video information in the watchHistory key. 
          // watchedHistory has array of object. 
          // object has key value pair of _id:"", title:"", etc along with another key value pair as owner:{ fullName:""}
          {
            $addFields:{
              owner:{
                $first: "$owner"
              }
            }
          },
        ],
      },
    },
  ]);
  return res
.status(200)
.json(
  new apiResponse(200,user[0].watchHistory,"Successfully fetched Watch History")
)
});



export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  updateFullName,
  getCurrentUser,
  updateAvatar,
  updateCoverImage,
  getChannelProfile,
  getWatchHistory,
};
