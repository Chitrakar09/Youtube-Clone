import mongoose from "mongoose";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.model.js";

const validateMongoId = (id, name = "id") => {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new apiError(400, `Invalid ${name}`);
};

const toggleSubscriptions = asyncHandler(async (req, res) => {
  // get the channel id and validate it
  // get the user/subscriber
  // check if there is already a document for that channel of the user
  // if there is then delete it else create a new document
  // return the response

  // get the channel id and validate it
  const {channelId} = req.params;

  if (!channelId) throw new apiError(400, "Chanel Id is required");

  validateMongoId(channelId, "channelId");

  // get the user/subscriber
  const subscriber = req.user?._id;

  //check if there is already a document of the subscriber for that model and delete if there is
  // generate a match condition
  const matchCondition = {
    subscriber,
    channel: channelId,
  };

  const result = await Subscription.deleteOne(matchCondition);

  const unsubscribed = result.deletedCount > 0;

  // return a response
  if (unsubscribed)
    return res
      .status(200)
      .json(new apiResponse(200, {}, "Successfully unsubscribed"));

  // if there is no document, create a new one for the model of that user

  const subscribed = await Subscription.create({
    subscriber,
    channel: channelId,
  });

  if (!subscribed) throw new apiError(500, "Couldn't toggle subscribe");

  return res
    .status(200)
    .json(new apiResponse(200, {}, "Successfully subscribed"));
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  // get the channelId and validate 
  // check if the channel owner and the user are the same (channel id is the id of the channel owner)
  // write the pipeline to get the subscribers based on channel
  // return the list of subscribers

  // get the channel id and validate it
  const { channelId } = req.params;

  if (!channelId) throw new apiError(400, "Chanel Id is required");

  validateMongoId(channelId, "channelId");

  // check if the channel owner and the user are the same

  if(channelId !== req.user?._id.toString()) throw new apiError(403,"Unauthorized")

  // get all the subscribers
  const listOfSubscribers = await Subscription.find({
    channel: channelId,
  }).populate("subscriber", "username fullName avatar");

  // return list of subscribers
  if (!listOfSubscribers || listOfSubscribers.length === 0)
    return res
      .status(200)
      .json(new apiResponse(200, {}, "The channel has no subscribers"));

  return res
    .status(200)
    .json(
      new apiResponse(200, listOfSubscribers, "Fetched all the subscribers"),
    );
});

const getSubscribedChannels= asyncHandler(async(req,res)=>{
    // get the subscriberId and validate 
  // check if the subscriber and the user are the same
  // write the pipeline to get the subscribed channel based on subscriber
  // return the list of subscribed channel

  // get the channel id and validate it
  const { subscriberId } = req.params;

  if (!subscriberId) throw new apiError(400, "Subscriber Id is required");

  validateMongoId(subscriberId, "subscriberId");

  // check if the channel owner and the user are the same

  if(subscriberId !== req.user?._id.toString()) throw new apiError(403,"Unauthorized")

  // get all the subscribers
  const listOfSubscribedChannels = await Subscription.find({
    subscriber:subscriberId,
  }).populate("channel", "username fullName avatar");

  // return list of subscribers
  if (!listOfSubscribedChannels || listOfSubscribedChannels.length === 0)
    return res
      .status(200)
      .json(new apiResponse(200, {}, "The subscriber has no subscribed channels"));

  return res
    .status(200)
    .json(
      new apiResponse(200, listOfSubscribedChannels, "Fetched all the subscribed channels"),
    );
})

export { toggleSubscriptions, getUserChannelSubscribers, getSubscribedChannels };
