import mongoose from "mongoose";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import fs from "fs";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Tweet } from "../models/tweet.model.js";

const validateMongoId = (id, name = "Id") => {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new apiError(400, `Invalid ${name}`);
};

const createTweet = asyncHandler(async (req, res) => {
  // get the media from the req.file if there is one
  // get the content of the tweet and validate it
  // if there is media then upload it to cloudinary and get the response
  // send all the data to the database
  // return a response

  // get the media and content
  const mediaLocalPath = req.file?.path;
  const { content } = req.body;

  // check if there is content and if not send error
  if (!content) {
    mediaLocalPath ? fs.unlinkSync(mediaLocalPath) : null;
    throw new apiError(400, "Content for tweet is required");
  }
  

  let mediaOnCloud = null;
  // if there is media then send to cloudinary
  if (mediaLocalPath) {
    mediaOnCloud = await uploadOnCloudinary(mediaLocalPath);
    if (!mediaOnCloud)
      throw new apiError(
        500,
        "Internal server error. Could not upload media of tweet",
      );
  }
  

  // send all the data to the database
  const tweet = await Tweet.create({
    tweetBy: req.user?._id,
    media: mediaOnCloud ? mediaOnCloud.url : null,
    content,
  });

  // return a response
  const createdTweet = await Tweet.findById(tweet._id);

  if (!createTweet) throw new apiError(500, "Could not create the tweet");

  return res
    .status(200)
    .json(new apiResponse(200, createdTweet, "Successfully created Tweet"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // get the userId and validate it
  // get the tweets of the user
  // send the response

  // get the userId and validate it
  const { userId } = req.params;

  validateMongoId(userId, "UserId");

  // get the tweets of the user
  const tweets = await Tweet.find({ tweetBy: userId }).populate(
    "tweetBy",
    "username fullName avatar",
  );

  if (!tweets || tweets.length === 0)
    return res.status(200).json(new apiResponse(200, {}, "No tweets found"));

  return res
    .status(200)
    .json(new apiResponse(200, tweets, "Fetched all the tweets of the user"));
});

const updateTweet = asyncHandler(async (req, res) => {
  // get the tweetId and validate it
  // check if the tweetBy and the user are same. If not not allowed
  // get the content to be updated
  // update the tweet
  // return the response

  // get the tweetId and validate it
  const { tweetId } = req.params;
  validateMongoId(tweetId, "Tweet Id");

  // get the content
  const { contentToUpdate } = req.body;

  if (!contentToUpdate) throw new apiError(400, "Provide content to update");

  const updatedTweet = await Tweet.findOneAndUpdate(
    {
      _id: tweetId,
      tweetBy: req.user?._id,
    },
    {
      content: contentToUpdate,
    },
    { new: true },
  );

  if (!updatedTweet)
    return res.status(200).json(new apiResponse(200, {}, "Tweet not found"));

  return res
    .status(200)
    .json(new apiResponse(200, updatedTweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  // get the tweetId and validate it
  // check if the tweetBy and the user are same. If not then not allowed
  // delete the tweet
  // return the response

  // get the tweetId and validate it
  const { tweetId } = req.params;
  validateMongoId(tweetId, "Tweet Id");

  const deletedTweet = await Tweet.findOneAndDelete({
    _id: tweetId,
    tweetBy: req.user?._id,
  });

  if (!deletedTweet)
    return res.status(200).json(new apiResponse(200, {}, "Tweet not found"));

  return res
    .status(200)
    .json(new apiResponse(200, {}, "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
