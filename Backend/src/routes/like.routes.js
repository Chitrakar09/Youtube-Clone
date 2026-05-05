import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { getLikedVideos, toggleLike } from "../controllers/like.controller.js";

const router= Router();
router.use(verifyJwt);

// route to toggle likes
router.route("/toggle/:modelId").post(toggleLike) //likes/123?modelType="Video"

// routes to get liked videos
router.route("/getLikedVideos").get(getLikedVideos)
export default router