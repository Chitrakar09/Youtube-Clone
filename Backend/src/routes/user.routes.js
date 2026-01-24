import { Router } from "express";
import {
  changePassword,
  getChannelProfile,
  getCurrentUser,
  getWatchHistory,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateAvatar,
  updateCoverImage,
  updateFullName,
} from "../controllers/user.controller.js";
import { uploadFile as uploadImage } from "../middlewares/uploadFile.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

// route for register
router.route("/register").post(
  uploadImage.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser,
);

// router for login
router.route("/login").post(loginUser); // router.route("/login").post(upload.none(),loginUser) if you want to get the data using form data

// secured routes

// route for logout
router.route("/logout").post(verifyJwt, logoutUser);

// route for refreshing accessToken
router.route("/refreshAccessToken").get(refreshAccessToken);

// route for updating password
router.route("/changePassword").patch(verifyJwt, changePassword);

// route for getting current user
router.route("/getCurrentUser").get(verifyJwt, getCurrentUser);

// route for changing full name
router.route("/updateFullName").patch(verifyJwt, updateFullName);

// route for updating avatar
router
  .route("/updateAvatar")
  .patch(verifyJwt, uploadImage.single("avatar"), updateAvatar);

// route for updating cover Image
router
  .route("/updateCoverImage")
  .patch(verifyJwt, uploadImage.single("coverImage"), updateCoverImage);

// route for getting user channel profile
router.route("/channel/:username").get(verifyJwt, getChannelProfile);

// route for getting watch history of user
router.route("/watchHistory").get(verifyJwt, getWatchHistory);

export default router;
