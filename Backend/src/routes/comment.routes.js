import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware";
import { createComment } from "../controllers/comment.controller";

const router = Router();

router.use(verifyJwt);

// route for creating a comment

router.route("/").post(createComment) // /comments?modelId=123&targetModel=Post

export default router