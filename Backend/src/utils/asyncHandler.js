//method 1: without using promises, using higher order functions

import { apiError } from "./apiError.js";

//concept:
/* 
    - how this function is used:
         Example:
        app.get("/user", asyncHandler(async (req, res) => {
            const user = await User.findById(req.params.id);
            res.json(user);
    }));

    - in asyncHandler, we pass the function 
    async (req, res) => {
            const user = await User.findById(req.params.id);
            res.json(user);
    }
        * here req,res are parameters not arguments

    - const asyncHandler = (fn) => async (req, res, next) => {}
        * here the req, res and next are automatically given by express
        
    -    await fn(req, res, next);
        * this runs the function:
            async (req, res) => {
            const user = await User.findById(req.params.id);
            res.json(user);
    }

    - if there is an error, catch sends the error to the higher order function
*/
const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    console.log(error)
    res.status(error.statusCode || 500).json({
      success: false,
      statusCode: error.statusCode,
      message:error.message || "Internal Server Error",
    });
  }
};

//method 2: using promises

/* How it works:
    - Express calls the route handler with (req, res, next).
    - asyncHandler takes that handler (requestHandler) and wraps it in a Promise.
    - If the Promise is rejected (async error), .catch(next) forwards the error
      to Express’s error-handling middleware.

  Key idea:
    Doesn’t handle the error itself — just forwards it cleanly using next().

  Example:
    app.get("/user", asyncHandler(async (req, res) => {
      const user = await User.findById(req.params.id);
      res.json(user);
    })); */

// const asyncHandler = (requestHandler) => {
//   (req, res, next) => {
//    return Promise.resolve(requestHandler(req, res, next)).catch((error) =>
//       next(error)
//     );
//   };
// };

export { asyncHandler };
