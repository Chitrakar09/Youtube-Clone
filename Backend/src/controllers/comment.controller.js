import mongoose from "mongoose";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Comment } from "../models/comments.model.js";

const validateMongoId = (id, name = "id") => {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new apiError(400, `Invalid ${name}`);
};

const createComment = asyncHandler(async (req, res) => {
  // get the targetModel and modelId and validate them
  // get the comment content and validate it
  // get the owner id and authorize
  // create the comment
  // send a response

  // get the targetModel and modelId and validate them
  const { modelId, targetModel } = req.query;

  if (!(modelId && targetModel))
    throw new apiError(
      400,
      "Both reference of the model and the model id are required",
    );

  if (targetModel !== ("Video" || "Tweet"))
    throw new apiError(400, "invalid target Model");
  validateMongoId(modelId, "Model Id");

  // get  the comment content and validate it
  const commentContent = req.body.comment;

  if (
    !commentContent ||
    commentContent.trim() === "" ||
    typeof commentContent !== "string"
  )
    throw new apiError(
      400,
      "Content of the comment is missing or invalid comment content",
    ); // typeOf returns a string 'string' not a type

  // create the comment
  const createdComment = await Comment.create({
    content: commentContent,
    owner: req.user?._id, // get the owner id and authorize it
    targetModel,
    modelId,
  });

  if (!createdComment) throw new apiError(500, "Couldn't create the comment");

  // send a response
  return res
    .status(200)
    .json(
      new apiResponse(201, createdComment, "Successfully created new comment"),
    );
});

const getComments = asyncHandler(async (req, res) => {
  // get the modelId and targetModel and validate them
  // get other queries such as pagination and sorting and validate them
  // get all the comments based on the modelId and other queries ( targetModel not required actually because we can query for the modelId eg: the videoId and get all the comments for that video. So no particular use of targetModel)
  // write the aggregation pipeline to get the username and avatar
  // send the response

  // get queries (modelId,targetModel, page, limit, sortOrder)
  const { modelId, targetModel, page, limit, sortOrder } = req.query;

  // validate modelId and targetModel
  if (!(modelId && targetModel))
    throw new apiError(
      400,
      "Both reference of the model and the model id are required",
    );

  if (targetModel !== ("Video" || "Tweet"))
    throw new apiError(400, "invalid target Model");
  validateMongoId(modelId, "Model Id");

  // validate other queries
  const pageNumber = parseInt(page, 10) || 1;
  const limitNumber = parseInt(limit, 10) || 10;

  if (pageNumber < 1 || isNaN(pageNumber))
    throw new apiError(400, "Invalid Page number");

  if (limitNumber < 1 || isNaN(limitNumber))
    throw new apiError(400, "Invalid Limit");

  const skip = (pageNumber - 1) * limitNumber;

  // setting the sortOrder
  const sortingOrder = {
    createdAt: sortOrder && sortOrder.toLowerCase() === "Newest" ? 1 : -1,
  };

  // aggregation pipeline
  const commentsList = await Comment.aggregate([
    {
      $match: {
        modelId: new mongoose.Types.ObjectId(modelId),
      },
    },
    { $sort: sortingOrder },
    { $skip: skip },
    { $limit: limitNumber },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "commenter",
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
        commenter: {
          $first: "$commenter",
        },
      },
    },
    {
      $project: {
        owner: 0,
      },
    },
  ]);

  // return the response
  if (!commentsList || commentsList.length === 0) {
    return res.status(200).json(
      new apiResponse(
        201,
        {
          comments: [],
          pagination: {
            totalComments: 0,
            totalPage: 0,
            currentPage: pageNumber,
            limit: limitNumber,
            hasNextPage: false,
            hasPrevPage: false,
          },
        },
        "No comments yet",
      ),
    );
  }

  const totalComments = await Comment.countDocuments({
    modelId: new mongoose.Types.ObjectId(modelId),
  });
  const totalPages = Math.ceil(totalComments / limitNumber);

  return res.status(200).json(
    new apiResponse(
      201,
      {
        comments: commentsList,
        pagination: {
          totalComments,
          totalPages,
          currentPage: pageNumber,
          limit: limitNumber,
          hasNextPage: pageNumber < totalPages,
          hasPrevPage: pageNumber > 1,
        },
      },
      "Comments successfully fetched",
    ),
  );
});

// edit a comment
const updateComment = asyncHandler(async (req, res) => {
  // get the comment id to be updated
  // get the user updating the comment
  // get the owner of the comment
  // check if the commenter and the user are same
  // if same the get the updated comment content and update the comment
  // return the response

  // get the comment id to be updated
  const { commentId } = req.params;

  if (!commentId) throw new apiError(400, "Comment Id is required");

  // validate the comment id
  validateMongoId(commentId, "commentId");

  // get the user updating the comment
  const user = req.user?._id;

  // get the owner of the comment
  const currentComment = await Comment.findById(commentId).select(
    "-content -targetModel -modelId",
  );

  if (!currentComment) throw new apiError(404, "Comment not found");

  // check if the user and the owner of the comment are same
  if (!currentComment.owner.equals(user))
    throw new apiError(403, "Unauthorized Access");

  // getting the updated comment content
  const comment = req.body?.comment;

  if (!comment) throw new apiError(400, "Provide the edited comment");

  // update the Comment
  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        ...(comment && { content: comment }),
      },
    },
    { new: true },
  );

  // return the response
  if (!updatedComment) throw new apiError(500, "Could not update the details");

  return res
    .status(200)
    .json(new apiResponse(200, updatedComment, "Comment edited"));
});

// delete a comment
const deleteComment = asyncHandler(async (req, res) => {
  // get the comment id to be updated
  // get the user updating the comment
  // get the owner of the comment
  // check if the commenter and the user are same
  // if same then delete the comment
  // return the response

  // get the comment id to be updated
  const { commentId } = req.params;

  if (!commentId) throw new apiError(400, "Comment Id is required");

  // validate the comment id
  validateMongoId(commentId, "commentId");

  // get the user updating the comment
  const user = req.user?._id;

  // get the owner of the comment
  const currentComment = await Comment.findById(commentId).select(
    "-content -targetModel -modelId",
  );

  if (!currentComment) throw new apiError(404, "Comment not found");

  // check if the user and the owner of the comment are same
  if (!currentComment.owner.equals(user))
    throw new apiError(403, "Unauthorized Access");

  // delete the comment
  const deletedComment = await Comment.findByIdAndDelete(commentId);

  // return the response
  if (!deletedComment) throw new apiError(500, "Could not delete the comment");

  return res
    .status(200)
    .json(new apiResponse(200, {}, "Successfully deleted the comment"));
});

export { createComment, getComments, updateComment, deleteComment };
