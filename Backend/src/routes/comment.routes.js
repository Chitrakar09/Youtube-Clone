import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { createComment } from "../controllers/comment.controller.js";

const router = Router();

router.use(verifyJwt);

// route for creating a comment

router.route("/").post(createComment) // /comments?modelId=123&targetModel=Post

export default router