import mongoose from "mongoose";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Tweet } from "../models/tweet.model.js";
import { Like } from "../models/likes.model.js";

const validateMongoId = (id, name = "id") => {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new apiError(400, `Invalid ${name}`);
};

const getChannelVideos = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId) throw new apiError(400, "Channel Id required");

  validateMongoId(channelId, "Channel Id");

  const listOfVideos = await Video.find({
    owner: channelId,
    ...(channelId !== req.user?._id.toString() && { isPublic: true }),
  })
    .select("owner thumbnail title description views duration")
    .populate("owner", "username fullName avatar");

  if (!listOfVideos)
    return res
      .status(200)
      .json(new apiResponse(200, {}, "There are no videos for the channel"));

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        listOfVideos,
        "Successfully fetched all videos of the channel",
      ),
    );
});

const getChannelStats = asyncHandler(async (req, res) => {
  // total video views, total subscribers, total videos, total likes, total tweets, total Duration, averageViewsPerVideo

  const { channelId } = req.params;

  if (!channelId) throw new apiError(400, "Channel Id is required");

  if (channelId !== req.user?._id.toString())
    throw new apiError(403, "Unauthorized");

  // get total videos, total views, total duration
  const channelStatsResult = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $group: {
        _id: null, // Groups all matched documents into one group. if _id: any other fields; then grouped according to that field. but due to null, grouped as one
        totalVideos: { $sum: 1 }, // for every document there is do count++
        totalViews: { $sum: "$views" }, // for every document there is do count=count+views
        totalDuration: { $sum: "$duration" }, // for every document there is do count=count+duration
      },
    },
  ]);

  // get subscribers count
  const subscriberCount = await Subscription.countDocuments({
    channel: channelId,
  });

  // get total likes
  const likeResult = await Like.aggregate([
    {
      $match: {
        modelType: "Video",
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "modelId",
        foreignField: "_id",
        as: "video",
      },
    },
    {
      $unwind: "$video",
    },
    {
      $match: {
        "video.owner": new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $count: "totalLikes",
    },
  ]);

  // get total tweets
  const tweetCount = await Tweet.countDocuments({
    tweetBy: channelId,
  });

  if (
    !(
      channelStatsResult ||
      channelStatsResult.length === 0 ||
      subscriberCount ||
      likeResult ||
      likeResult.length === 0 ||
      tweetCount
    )
  )
    throw new apiError(500, "Something went wrong. Internal Server error");

  // overall channel stats
  const channelStats = {
    totalVideos: channelStatsResult[0]?.totalVideos ?? 0,
    totalViews: channelStatsResult[0]?.totalViews ?? 0,
    totalDuration: channelStatsResult[0]?.totalDuration ?? 0,
    averageViewsPerVideo:
      (channelStatsResult[0]?.totalVideos ?? 0) > 0
        ? Math.round(
            channelStatsResult[0].totalViews /
              channelStatsResult[0].totalVideos,
          )
        : 0,
    totalSubscribers: subscriberCount,
    totalLikes: likeResult[0]?.totalLikes ?? 0,
    totalTweets: tweetCount,
  };

  return res.status(200).json(
    new apiResponse(
      200,
      {
        channelStats,
      },
      "Successfully fetched channel statistics",
    ),
  );
});

export { getChannelVideos, getChannelStats };
