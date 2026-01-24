import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { uploadVideoOnCloudinary } from "../utils/cloudinary.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { deleteOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";
import fs from "fs";

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
    fs.unlinkSync(req.files?.thumbnail?.[0]?.path)
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
  if (!videoOnCloud) throw new apiError(
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
    isPublic: isPublic?isPublic:true,
  });

  const createdVideo = await Video.findById(video._id);

  if (!createdVideo) throw new apiError(500, "Could not upload the video");

  return res
    .status(201)
    .json(new apiResponse(201, createdVideo, "Video successfully uploaded"));
});

export { uploadVideo };
