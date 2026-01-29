import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { uploadVideoOnCloudinary } from "../utils/cloudinary.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { deleteOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";
import fs from "fs";
import mongoose from "mongoose";
import { title } from "process";

// function to check if the given userId is valid
const validateMongoId = (id, name = "Id") => {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new apiError(400, `Invalid ${name}`);
};

// upload the video to database
const uploadVideo = asyncHandler(async (req, res) => {
  //get the data from the user =>done
  //get the video and thumbnail =>done
  //validate if the data are there =>done
  //upload the video to cloudinary =>done
  //upload the thumbnail to cloudinary =>done
  //get the response for video and thumbnail from cloudinary =>done
  //save all the data into the database =>done
  //return response =>done

  // getting the video and thumbnail and validating them
  const videoLocalPath = req.files?.video?.[0]?.path;
  if (!videoLocalPath) {
    fs.unlinkSync(req.files?.thumbnail?.[0]?.path);
    throw new apiError(400, "Video is required");
  }

  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
  if (!thumbnailLocalPath) {
    fs.unlinkSync(videoLocalPath);
    throw new apiError(400, "thumbnail is required");
  }

  // getting the details of video and verifying them
  const { title, description, isPublic } = req.body;
  if (!(title && description)) {
    fs.unlinkSync(videoLocalPath);
    fs.unlinkSync(thumbnailLocalPath);
    throw new apiError(400, "Title and Description are required");
  }

  // upload video and image to cloudinary

  const videoOnCloud = await uploadVideoOnCloudinary(videoLocalPath);
  if (!videoOnCloud)
    throw new apiError(
      500,
      "Internal server error. Could not upload video on cloud",
    );

  const thumbnailOnCloud = await uploadOnCloudinary(thumbnailLocalPath);
  if (!thumbnailOnCloud) {
    await deleteOnCloudinary(videoOnCloud.url);
    throw new apiError(
      500,
      "Internal server error. Could not upload thumbnail on cloud",
    );
  }

  // send the data to the database
  const video = await Video.create({
    videoFile: videoOnCloud.url,
    thumbnail: thumbnailOnCloud.url,
    owner: req.user?._id,
    title,
    description,
    duration: videoOnCloud.duration,
    isPublic: isPublic ? isPublic : true,
  });

  const createdVideo = await Video.findById(video._id);

  if (!createdVideo) throw new apiError(500, "Could not upload the video");

  return res
    .status(201)
    .json(new apiResponse(201, createdVideo, "Video successfully uploaded"));
});

// get all video
const getAllVideo = asyncHandler(async (req,res) => {
  // get the queries
  // validate the queries
  // write the aggregate pipeline based on the queries
  // paginate the result
  // send the paginated result as response

  // get the queries and validate
  const { page, limit, search, sortBy, sortOrder, userId } = req.query; // query-> what to search for, sortBy-> title, views etc, sortOrder-> ascending or descending

  // parameters we get from the url are string
  // converting page and limit to integer and checking if they are valid
  const pageNumber = parseInt(page, 10) || 1;
  const limitNumber = parseInt(limit, 10) || 10;

  if (pageNumber < 1 || isNaN(pageNumber))
    throw new apiError(400, "Invalid Page number");

  if (limitNumber < 1 || isNaN(limitNumber))
    throw new apiError(400, "Invalid limit");

  const skip = (pageNumber - 1) * limitNumber; // Example: page 2 with limit 10 means skip first 10 videos

  // formatting the queries for easier aggregate pipeline

  // # setting the match condition
  const matchCondition = {}; // initializing empty object for the query. later becomes something like matchCondition={owner:"1234",search:"to be searched",isPublic:true}

  // based on username if provided
  if (userId) {
    validateMongoId(userId, "User Id");
    matchCondition.owner = new mongoose.Types.ObjectId(userId); // convert userId string to MongoDB object Id format
  }

  // based on search query if provided
  if (search) {
    matchCondition.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
    // $or: -> match if any of these conditions are true, $options:"i" -> makes the search case-insensitive
  }

  // based on isPublic
  matchCondition.isPublic = true;

  // # setting the sorting options
  const sortOptions = {};

  // if sort by is provided, sort based on that
  if (sortBy) {
    sortOptions[sortBy] =
      sortOrder && sortOrder.toLowerCase() === "asc" ? 1 : -1;
    // sortOptions={title:1}, sortBy=title, asc= ascending(1) and anything else is descending(-1)
  } else {
    sortOptions.createdAt = -1; // Default: sort according to the latest creation date
  }

  // aggregation pipeline
  const videoList = await Video.aggregate([
    { $match: matchCondition }, // get the videos based on the query
    { $sort: sortOptions }, //sort
    { $skip: skip }, //skipping the unwanted
    { $limit: limitNumber }, // getting only the limit allowed number of docs
    {
      $lookup: {
        // get the owner info
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
        /* 
        originally from lookup:"owner": [{ "fullName": "Pratyush", "username": "chitrakar09", "avatar": "url" }]

        result after addFields: "owner": { "fullName": "Pratyush", "username": "chitrakar09", "avatar": "url" }

        $addFields + $first → keeps 1 document, just flattens the array into a single object.

        $unwind → also flattens, but if there were multiple items, it would create multiple documents, one for each array element. Example:
        for single elements
        {
          "_id": 1,
          "title": "My Video",
          "owner": { "fullName": "Pratyush", "username": "chitrakar09" }
        }
        for multiple elements:
        { "_id": 1, "title": "My Video", "owner": { "fullName": "Alice" } }
        { "_id": 1, "title": "My Video", "owner": { "fullName": "Bob" } }

        why do this: because lookup gives you an array irrespective of no. of elements. Example:
        "owner": [
        { "fullName": "Alice" },
        { "fullName": "Bob" }
        ]

         */
        owner: {
          $first: "$owner",
        },
      },
    }
  ]);

  if(!videoList || videoList.length==0){
    return res
    .status(200)
    .json(
      new apiResponse(
        201,
        {
          videos:[],
          pagination:{
            totalVideos:0,
            totalPages:0,
            currentPage:pageNumber,
            limit:limitNumber,
            hasNextPage:false,
            hasPrevPage:false
          }
        },
        "No videos found"
      )
    )
  }

  const totalVideos= await Video.countDocuments(matchCondition) // count total videos based on the match conditions
  const totalPages= Math.ceil(totalVideos/limitNumber) // Example: 25 videos with limit 10 = 3 pages. Math.ceil gives the nearest highest integer

  return res
  .status(200)
  .json(
    new apiResponse(
      201,
      {
        videos:videoList,
        pagination:{
          totalVideos,
          totalPages,
          currentPage:pageNumber,
          limit:limitNumber,
          hasNextPage:pageNumber<totalPages,
          hasPrevPage:pageNumber>1
        }
      },
      "Videos successfully fetched"
    )
  )
});

export { uploadVideo, getAllVideo };
