
// how to use it
/*
    app.get("/user/:id", asyncHandler(async (req, res) => {
        const user = await User.findById(req.params.id);
        if (!user) throw new apiError(404, "User not found");
        res.json({ success: true, data: user });
    }));

*/

class apiError extends Error{
    constructor(
        statusCode,
        message = "Something went wrong",
        errors =[],
        stack = ""
    ){
        super(message)
        this.statusCode= statusCode
        this.data = null
        this.success = false
        this.errors = errors

        if(stack){
            this.stack=stack
        } else{
          Error.captureStackTrace(this,this.constructor)  
        }
    }
}

export {apiError}
