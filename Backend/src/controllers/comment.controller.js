import mongoose from "mongoose";
import { apiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";
import { apiResponse } from "../utils/apiResponse";

const validateMongoId=(id,name="id")=>{
    if(!mongoose.Types.ObjectId.isValid(id)) throw new apiError(400,`Invalid ${name}`)
}

const createComment= asyncHandler(async(req,res)=>{
    // get the targetModel and modelId and validate them
    // get the comment content and validate it
    // get the owner id and authorize
    // create the comment
    // send a response

    // get the targetModel and modelId and validate them
    const {modelId, targetModel}= req.query

    if(!(modelId || targetModel)) throw new apiError(400,"Reference of the model and the model id are required")
    
    validateMongoId(modelId,"Model Id")
    
    // get the comment content and validate it
    const commentContent=req.body

    if(!commentContent || commentContent.trim()==="" || typeof commentContent !== String ) throw new apiError(400,"Content of the comment is missing or invalid comment content")
    
    // create the comment
    const createdComment= await Comment.create({
        content:commentContent,
        owner: req.user?._id, // get the owner id and authorize it
        targetModel,
        modelId
    })

    if(!createdComment) throw new apiError(500,"Couldn't create the comment")
    
    // send a response
    return res.status(200)
    .json(
        new apiResponse(201,createComment,"Successfully created new comment")
    )
})

export {createComment};