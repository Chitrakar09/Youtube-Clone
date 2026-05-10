import mongoose,{Schema} from "mongoose";

const tweetSchema= new Schema({
    tweetBy:{
        type: Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    media:{
        type:String
    },
    content:{
        type:String,
        required:true
    }
},{timestamps:true})

export const Tweet= mongoose.model("Tweet",tweetSchema)  