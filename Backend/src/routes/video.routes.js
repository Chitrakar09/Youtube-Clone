import { Router } from "express";
import { getAllVideo, getVideoById, uploadVideo } from "../controllers/video.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { uploadFile } from "../middlewares/uploadFile.middleware.js";

const router = Router();

// verifyJwt for all routes
router.use(verifyJwt);

// route for:
router
  .route("/")
  //  uploading video
  .post(
    uploadFile.fields([
      { name: "thumbnail", maxCount: 1 },
      { name: "video", maxCount: 1 },
    ]),
    uploadVideo,
  )
  // get video based on query. url example: https://example.com/videos?page=1&limit=10&search=text&sortBy=title
  .get(getAllVideo);

router
.route("/:videoId")
.get(getVideoById)

export default router;
