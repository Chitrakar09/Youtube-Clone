import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    targetModel: {
      type: String,
      required: true,
      enum: ["Video", "Tweet", "Comment"],
    },
    modelId: {
      type: Schema.Types.ObjectId,
      refPath: "targetModel",
      required: true,
    },
  },
  { timestamps: true },
);

export const Comment = mongoose.model("Comment", commentSchema);
