import { Like } from "../models/likes.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const validateMongoId = (id, name = "Id") => {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new apiError(400, `Invalid ${name}`);
};

const toggleLike = asyncHandler(async (req, res) => {
  //get the modelId and model type and validate the modelId
  //get the user/liker
  //check if there is already a document of the user for that model
  //if there is a document, then delete the document
  //if there is no document, then create a new one for the model of that user
  //send the response

  // get the modelId and model type
  const { modelType } = req.query;
  const { modelId } = req.params;

  // validate the modelId and model type
  if (!(modelId && modelType))
    throw new apiError(400, "modelId and modelType are required");

  if (modelType !== ("Video" || "Tweet" || "Comment"))
    throw new apiError(400, "invalid target Model");

  validateMongoId(modelId, `${modelType} Id`);

  // get the user/liker
  const likedBy = req.user?._id;

  //check if there is already a document of the user for that model and delete if there is
  // generate a match condition
  const matchCondition = {
    likedBy,
    modelId,
    modelType,
  };

  const result = await Like.deleteOne(matchCondition);

  const unLiked = result.deletedCount > 0;

  // return a response
  if (unLiked)
    return res
      .status(200)
      .json(new apiResponse(200, {}, "Successfully unLiked"));

  // if there is no document, create a new one for the model of that user

  const liked = await Like.create({
    likedBy,
    modelType,
    modelId,
  });

  if (!liked) throw new apiError(500, "Couldn't toggle like");

  return res.status(200).json(new apiResponse(200, {}, "Successfully liked"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  // get the targetModel
  // validate the targetModel
  // get the user
  // write the aggregation pipeline to get all the videos liked by the user based on target model
  // send the response

  // get the target model and validate it
  const { modelType } = req.query;
  if (
    !modelType &&
    modelType.toLowerCase() !== ("video" || "tweet" || "comment")
  )
    throw new apiError(400, "invalid target Model");

  // get the user
  const user = req.user?._id;

  //generate the match condition
  const matchCondition = {
    modelType: modelType,
    likedBy: user,
  };

  //write the aggregation pipeline to get all the videos liked by the user based on target model

  const likedVideos = await Like.aggregate([
    {
      $match: matchCondition,
    },
    {
      $lookup: {
        from: "videos",
        localField: "modelId",
        foreignField: "_id",
        as: "video",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
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
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
    {
      $unwind: "$video",
    },
    {
      $project: {
        _id: { $toString: "$_id" },
        modelType: 1,
        video: {
          _id: { $toString: "$video._id" },
          title: 1,
          thumbnail: 1,
          owner: {
            _id: { $toString: "$video.owner._id" },
            fullName: 1,
            username: 1,
            avatar: 1,
          },
        },
      },
    },
  ]);

  if (!likedVideos)
    return res
      .status(200)
      .json(new apiResponse(200, {}, "No liked videos found"));

  return res
    .status(200)
    .json(
      new apiResponse(200, likedVideos, "Successfully fetched liked videos"),
    );
});

export { toggleLike, getLikedVideos };
