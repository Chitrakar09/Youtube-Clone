import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscriptions,
} from "../controllers/subscription.controller.js";

const router = Router();
router.use(verifyJwt);

//route to toggleSubscriptions
router.route("/toggleSubscription/:channelId").post(toggleSubscriptions);

//route to get User Channel Subscribers
router.route("/getChannelSubscribers/:channelId").get(getUserChannelSubscribers);

//route to get Subscribed Channels
router.route("/getSubscribedChannels/:subscriberId").get(getSubscribedChannels);
export default router;
