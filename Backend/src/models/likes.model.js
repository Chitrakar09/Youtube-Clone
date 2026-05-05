import mongoose,{Schema} from "mongoose";

const likeSchema = new Schema({
    likedBy:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required:true
    },
    modelType: {
      type: String,
      required: true,
      enum: ["Video", "Tweet","Comment"],
    },
    modelId: {
      type: Schema.Types.ObjectId,
      refPath: "targetModel",
      required: true,
    },

},{timestamps:true})

likeSchema.index({ likedBy: 1,modelType:1, modelId: 1 }, { unique: true });

export const Like= mongoose.model("Like",likeSchema)