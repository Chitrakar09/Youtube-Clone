import { Router } from "express";
import { uploadVideo } from "../middlewares/uploadVideoFile.middleware.js";
import { uploadVideo } from "../controllers/video.controller.js";

const router = Router();

// route for uploading video
router.route("/uploadVideo").post(uploadVideo.single("video"), uploadVideo);

export default router;
