import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylist, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller.js";

const router = Router();
router.use(verifyJwt);

// route to create playlist
router.route("/").post(createPlaylist)

router
    .route("/:playListId")
    .get(getPlaylistById) // route to get playlist by Id
    .patch(updatePlaylist) // route to update the playlist
    .delete(deletePlaylist); // route to delete the playlist

router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist); // route to add video to the playlist
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist); // route to remove a video from the playlist

router.route("/user/:userId").get(getUserPlaylist); // route to get the user playlist

export default router;
