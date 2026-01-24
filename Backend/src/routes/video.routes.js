import { Router } from "express";
import { uploadVideo as parseVideo } from "../middlewares/uploadVideoFile.middleware.js";
import { uploadVideo } from "../controllers/video.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { uploadFile } from "../middlewares/uploadFile.middleware.js";

const router = Router();

// route for uploading video
router.route("/uploadVideo").post(
  verifyJwt,
  uploadFile.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  uploadVideo,
);

export default router;
