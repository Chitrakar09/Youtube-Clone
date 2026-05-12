import mongoose from "mongoose";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlist.model.js";

const validateMongoId = (id, name = "id") => {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new apiError(400, `Invalid ${name}`);
};

const createPlaylist = asyncHandler(async (req, res) => {
  // get the playlist title and the description
  // create a new playlist
  // return a response

  // get the playlist title and the description
  const { name, description } = req.body;

  if (!name) throw new apiError(400, "Provide a playlist name");

  // create a new playlist
  const playlist = await Playlist.create({
    name,
    description: description ? description : null,
    owner: req.user?._id,
  });

  // return a response
  const createdPlaylist = await Playlist.findById(playlist._id);

  if (!createdPlaylist)
    throw new apiError(
      500,
      "Internal Server Error. Could not create the playlist.",
    );

  return res
    .status(200)
    .json(
      new apiResponse(200, createdPlaylist, "Playlist successfully created"),
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  // get the playlist id and validate it
  // get the playlist
  // send a response

  // get the playlist id and validate it
  const { playListId } = req.params;
  validateMongoId(playListId, "Playlist Id");

  const playlist = await Playlist.findById(playListId).populate([
    {
      path: "owner",
      select: "avatar username fullName",
    },
    {
      path: "videos",
      select: "videoFile thumbnail owner title views",
      populate: {
        path: "owner",
        select: "avatar username fullName",
      },
    },
  ]);

  if (!playlist || playlist.length === 0)
    return res.status(200).json(new apiResponse(200, {}, "Playlist not found"));

  return res
    .status(200)
    .json(new apiResponse(200, playlist, "Successfully fetched Playlist"));
});

const getUserPlaylist = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  validateMongoId(userId, "UserId");

  if (userId !== req.user?._id.toString())
    throw new apiError(403, "Unauthorized");

  const playlist = await Playlist.find({ owner: userId }).populate([
    {
      path: "owner",
      select: "avatar username fullName",
    },
    {
      path: "videos",
      select: "videoFile thumbnail owner title views",
      populate: {
        path: "owner",
        select: "avatar username fullName",
      },
    },
  ]);

  if (!playlist || playlist.length === 0)
    return res
      .status(200)
      .json(new apiResponse(200, {}, "User does not have any playlist"));

  return res
    .status(200)
    .json(
      new apiResponse(200, playlist, "Successfully fetched User's Playlist"),
    );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!(playlistId && videoId))
    throw new apiError(400, "Playlist id and videoId are required");

  validateMongoId(playlistId, "PlaylistId");
  validateMongoId(videoId, "VideoId");

  const result = await Playlist.updateOne(
    { _id: playlistId },
    {
      $addToSet: {
        videos: new mongoose.Types.ObjectId(videoId),
      },
    },
  );

  if (result.modifiedCount === 0)
    return res
      .status(200)
      .json(new apiResponse(200, {}, "Video already available in playlist"));

  return res
    .status(200)
    .json(new apiResponse(200, {}, "Video added to the playlist"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!(playlistId && videoId))
    throw new apiError(400, "Playlist id and videoId are required");

  validateMongoId(playlistId, "PlaylistId");
  validateMongoId(videoId, "VideoId");

  const result = await Playlist.updateOne(
    { _id: playlistId },
    {
      $pull: {
        videos: videoId,
      },
    },
    {
      new: true,
    },
  );

  if (result.modifiedCount === 0)
    return res.status(200).json(new apiResponse(200, {}, "Video Not Found"));

  return res
    .status(200)
    .json(new apiResponse(200, {}, "Video removed from the playlist"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playListId } = req.params;

  if (!playListId) throw new apiError(400, "Playlist Id required");

  validateMongoId(playListId, "PlaylistId");

  const deletedPlaylist = await Playlist.findOneAndDelete({
    _id: playListId,
    owner: req.user?._id,
  });

  if (!deletedPlaylist)
    return res.status(200).json(new apiResponse(200, {}, "Playlist not found"));

  return res
    .status(200)
    .json(new apiResponse(200, {}, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playListId } = req.params;

  if (!playListId) throw new apiError(400, "Playlist Id is required");

  validateMongoId(playListId, "Playlist Id");

  const { name, description } = req.body || {};

  if (!(name || description))
    throw new apiError(400, "Provide name or description to update");

  const updatedPlaylist = await Playlist.findOneAndUpdate(
    {
      _id: playListId,
      owner: req.user?._id,
    },
    {
      $set: {
        ...(name && { name }),
        ...(description && { description }),
      },
    },
    { new: true },
  ).populate([
    {
      path: "owner",
      select: "avatar username fullName",
    },
    {
      path: "videos",
      select: "videoFile thumbnail owner title views",
      populate: {
        path: "owner",
        select: "avatar username fullName",
      },
    },
  ]);

  if (!updatedPlaylist)
    return res.status(200).json(new apiResponse(200, {}, "Playlist not found"));

  return res
    .status(200)
    .json(
      new apiResponse(200, updatedPlaylist, "Playlist updated successfully"),
    );
});

export {
  createPlaylist,
  getPlaylistById,
  getUserPlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  updatePlaylist,
  deletePlaylist,
};
