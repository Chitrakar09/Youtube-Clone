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
import commentRouter from './routes/comment.routes.js'
import likeRouter from './routes/like.routes.js'
import healthCheckRouter from './routes/healthCheck.routes.js'
import subscriptionRouter from "./routes/subscriptions.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
// routes declaration

// route for user
app.use("/api/v1/users",userRouter)
//http://localhost:8000/api/v1/users/register

//route for video
app.use("/api/v1/videos",videoRouter)

//route for comments
app.use("/api/v1/comments",commentRouter)

//route for likes
app.use("/api/v1/likes",likeRouter)

//route for health check
app.use("/api/v1/healthCheck",healthCheckRouter)

//route for subscriptions
app.use("/api/v1/subscription",subscriptionRouter)

//route for dashboard
app.use("/api/v1/dashboard",dashboardRouter)

//route for playlist
app.use("/api/v1/playlist",playlistRouter)

//route for tweet
app.use("/api/v1/tweet",tweetRouter)




export { app };
