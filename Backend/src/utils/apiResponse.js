class apiResponse{
    constructor(statusCode, data , message = "success"){
        this.statusCode=statusCode
        this.data=data
        this.message=message
        this.success = statusCode < 400 // if statusCode < 400 then this.success = true and vice versa
    }
}

export{apiResponse}