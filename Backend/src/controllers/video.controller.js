import { asyncHandler } from "../utils/asyncHandler";
import { apiError } from "../utils/apiError";
import { apiResponse } from "../utils/apiResponse";
import { uploadVideoOnCloudinary } from "../utils/cloudinary";
import { uploadOnCloudinary } from "../utils/cloudinary";

// upload the video to database
const uploadVideo = asyncHandler(async (req, res) => {});

export { uploadVideo };
