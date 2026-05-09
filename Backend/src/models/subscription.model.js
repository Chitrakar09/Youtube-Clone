import mongoose,{ Schema } from "mongoose";

const subscriptionSchema=  new Schema({
    subscriber:{
        type: Schema.Types.ObjectId,
        ref:"User"
    },
    channel:{ // channel is the username of the channel owner
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

export const Subscription= mongoose.model("Subscription",subscriptionSchema)