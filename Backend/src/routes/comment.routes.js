import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
  createComment,
  deleteComment,
  getComments,
  updateComment,
} from "../controllers/comment.controller.js";

const router = Router();

// route for creating and getting comment
router
  .route("/")
  .post(verifyJwt, createComment) // /comments?modelId=123&targetModel=Video
  .get(getComments) // /comments?modelId=123&targetModel=Video

// route for updating and deleting a comment
router.route("/:commentId")
.patch(verifyJwt,updateComment) // /comments/1234
.delete(verifyJwt,deleteComment)  // /comments/1234

export default router;
