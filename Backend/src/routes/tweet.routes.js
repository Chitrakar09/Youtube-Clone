import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
  createTweet,
  deleteTweet,
  getUserTweets,
  updateTweet,
} from "../controllers/tweet.controller.js";
import { uploadFile } from "../middlewares/uploadFile.middleware.js";

const router = Router();
router.use(verifyJwt);

// route to create tweet
router.route("/").post(uploadFile.single("media"), createTweet);

// route to get user tweets
router.route("/user/:userId").get(getUserTweets);

// route to update and delete tweet
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet);

export default router;
