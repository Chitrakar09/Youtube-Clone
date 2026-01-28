import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// Middleware for CORS conflict resolve
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// Middleware to parse JSON request bodies
app.use(
  express.json({
    limit: "16kb",
  })
);

// Middleware to parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Middleware to serve static files from a directory
app.use(express.static("public"))
 

// Middleware to parse cookies
app.use(cookieParser())


// import routes

import userRouter from './routes/user.routes.js'
import videoRouter from './routes/video.routes.js'

// routes declaration

// route for user
app.use("/api/v1/users",userRouter)
//http://localhost:8000/api/v1/users/register

//route for video
app.use("/api/v1/videos",videoRouter)

export { app };
