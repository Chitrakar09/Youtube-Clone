import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { createComment, getComments } from "../controllers/comment.controller.js";

const router = Router();

// route for creating a comment

router.route("/").post(verifyJwt,createComment) // /comments?modelId=123&targetModel=Video
router.route("/").get(getComments) // /comments?modelId=123&targetModel=Video

export default router