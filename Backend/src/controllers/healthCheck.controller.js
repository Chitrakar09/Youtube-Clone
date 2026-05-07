import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";

const healthCheck= asyncHandler(async(req,res)=>{
return res.status(200).json(new apiResponse(200,{},"Ok"))
})

export {healthCheck}