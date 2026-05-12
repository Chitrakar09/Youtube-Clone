# VideoTube

[![Repository](https://img.shields.io/badge/github-Chitrakar09%2FYoutube--Clone-181717?style=flat&logo=github)](https://github.com/Chitrakar09/Youtube-Clone)
[![License](https://img.shields.io/badge/license-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16-brightgreen.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/mongodb-%3E%3D6-47A248.svg)](https://www.mongodb.com/)

## VideoTube

A professional backend service for a learning-focused MERN video-sharing application. VideoTube is designed to handle user accounts, video upload and management, reactions, comments, subscriptions, playlists, and channel analytics.

---

## Demo / Live Preview

This repository contains the backend API for the VideoTube project. It is built to work with a frontend client and can be launched locally for API integration and end-to-end testing.

> A live preview is available once the backend is deployed and connected to a frontend client.

---

## Key Features

- User authentication with JWT & refresh token flow
- Secure registration, login, logout, and profile management
- Video upload with thumbnail and Cloudinary storage
- Video CRUD operations with publish controls
- Commenting system for videos and tweets
- Like toggle and liked content retrieval
- Channel subscription management
- Playlist creation and video organization
- Tweet-style media posts
- Channel dashboard with analytics and video listings
- Health check endpoint for uptime verification

---

## Tech Stack

| Layer | Technology |
|------|------------|
| Runtime | Node.js |
| Web Framework | Express 5 |
| Database | MongoDB with Mongoose |
| Authentication | JSON Web Tokens (JWT) |
| File Upload | Multer + Cloudinary |
| Environment | dotenv / @dotenvx/dotenvx |
| Middleware | CORS, cookie-parser |
| Dev Tools | nodemon |

---

## Installation

1. Clone the repository:

```bash
git clone https://github.com/Chitrakar09/Youtube-Clone.git
```

2. Change into the backend directory:

```bash
cd Youtube-Clone/Backend
```

3. Install dependencies:

```bash
npm install
```

---

## Environment Variables Setup

Copy the sample environment file and configure your values:

```bash
cp .env.sample .env
```

Update `.env` with valid credentials:

| Variable | Description |
|----------|-------------|
| `PORT` | HTTP server port (default 8000) |
| `MONGODB_URL` | MongoDB connection URI |
| `CORS_ORIGIN` | Frontend allowed origin |
| `ACCESS_TOKEN_SECRET` | JWT access token secret |
| `ACCESS_TOKEN_EXPIRY` | Access token expiry time (e.g. `15m`) |
| `REFRESH_TOKEN_SECRET` | JWT refresh token secret |
| `REFRESH_TOKEN_EXPIRY` | Refresh token expiry time (e.g. `7d`) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

---

## Running the Project Locally

Start the backend service with:

```bash
npm run dev
```

Expected output:

- `App is listening on port <PORT>`
- `MongoDB successfully connected`

Default local API base URL:

```text
http://localhost:8000/api/v1
```

---

## Folder Structure

<details>
<summary>Backend folder structure</summary>

```text
Backend/
├── .env.sample
├── package.json
├── public/
│   └── temp/
├── src/
│   ├── app.js
│   ├── constants.js
│   ├── index.js
│   ├── controllers/
│   │   ├── comment.controller.js
│   │   ├── dashboard.controller.js
│   │   ├── healthCheck.controller.js
│   │   ├── like.controller.js
│   │   ├── playlist.controller.js
│   │   ├── subscription.controller.js
│   │   ├── tweet.controller.js
│   │   ├── user.controller.js
│   │   └── video.controller.js
│   ├── db/
│   │   └── index.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   └── uploadFile.middleware.js
│   ├── models/
│   │   ├── comments.model.js
│   │   ├── likes.model.js
│   │   ├── playlist.model.js
│   │   ├── subscription.model.js
│   │   ├── tweet.model.js
│   │   ├── user.model.js
│   │   └── video.model.js
│   ├── routes/
│   │   ├── comment.routes.js
│   │   ├── dashboard.routes.js
│   │   ├── healthCheck.routes.js
│   │   ├── like.routes.js
│   │   ├── playlist.routes.js
│   │   ├── subscriptions.routes.js
│   │   ├── tweet.routes.js
│   │   ├── user.routes.js
│   │   └── video.routes.js
│   └── utils/
│       ├── apiError.js
│       ├── apiResponse.js
│       ├── asyncHandler.js
│       └── cloudinary.js
```

</details>

---

## API Endpoints

### Authentication & Users

- `POST /api/v1/users/register` — register a new user with avatar and cover image
- `POST /api/v1/users/login` — login user and receive access token
- `POST /api/v1/users/logout` — invalidate current session
- `GET /api/v1/users/refreshAccessToken` — refresh JWT access token
- `PATCH /api/v1/users/changePassword` — change password
- `GET /api/v1/users/getCurrentUser` — get authenticated user details
- `PATCH /api/v1/users/updateFullName` — update display name
- `PATCH /api/v1/users/updateAvatar` — update user avatar
- `PATCH /api/v1/users/updateCoverImage` — update cover image
- `GET /api/v1/users/channel/:username` — get channel profile by username
- `GET /api/v1/users/watchHistory` — get authenticated user watch history

### Video Management

- `POST /api/v1/videos/` — upload a video with thumbnail
- `GET /api/v1/videos/` — list videos with pagination and search
- `GET /api/v1/videos/:videoId` — get video details
- `PATCH /api/v1/videos/:videoId` — update video metadata or thumbnail
- `DELETE /api/v1/videos/:videoId` — delete a video
- `PATCH /api/v1/videos/toggle/publish/:videoId` — toggle video visibility

### Comments

- `POST /api/v1/comments/` — add a comment to a video or tweet
- `GET /api/v1/comments/` — list comments for a target item
- `PATCH /api/v1/comments/:commentId` — update an existing comment
- `DELETE /api/v1/comments/:commentId` — delete a comment

### Likes

- `POST /api/v1/likes/toggle/:modelId` — like or unlike a target model
- `GET /api/v1/likes/getLikedVideos` — list liked videos for user

### Subscriptions

- `POST /api/v1/subscription/toggleSubscription/:channelId` — subscribe or unsubscribe
- `GET /api/v1/subscription/getChannelSubscribers/:channelId` — channel subscriber list
- `GET /api/v1/subscription/getSubscribedChannels/:subscriberId` — user subscriptions

### Playlists

- `POST /api/v1/playlist/` — create a playlist
- `GET /api/v1/playlist/:playListId` — retrieve playlist details
- `PATCH /api/v1/playlist/:playListId` — edit playlist
- `DELETE /api/v1/playlist/:playListId` — delete playlist
- `PATCH /api/v1/playlist/add/:videoId/:playlistId` — add video to playlist
- `PATCH /api/v1/playlist/remove/:videoId/:playlistId` — remove video from playlist
- `GET /api/v1/playlist/user/:userId` — get playlists for a user

### Tweets

- `POST /api/v1/tweet/` — create a tweet-style update with optional media
- `GET /api/v1/tweet/user/:userId` — get tweets for a user
- `PATCH /api/v1/tweet/:tweetId` — update a tweet
- `DELETE /api/v1/tweet/:tweetId` — delete a tweet

### Dashboard

- `GET /api/v1/dashboard/stats/:channelId` — channel analytics
- `GET /api/v1/dashboard/videos/:channelId` — channel video list

### Health Check

- `GET /api/v1/healthCheck/` — service health status

---

## Authentication Flow

1. User registers with profile and credentials.
2. Server creates hashed password and stores user data.
3. Login returns an access token and refresh token.
4. Protected routes require `verifyJwt` middleware.
5. Access tokens are refreshed via `GET /api/v1/users/refreshAccessToken`.
6. Logout invalidates the refresh token and ends the session.

---

## Database Schema Overview

- `User` stores credentials, profile, avatar, cover image, watch history, and refresh tokens.
- `Video` stores owner reference, media URLs, title, description, views, and publication state.
- `Comment` supports polymorphic relationships for `Video` and `Tweet` targets.
- `Subscription` connects channel owners and subscribers.
- `Playlist` organizes videos for each user.
- `Tweet` supports short content and optional media attachments.

---

## Deployment Instructions

1. Provision a Node.js environment and MongoDB instance.
2. Deploy backend to a platform such as Heroku, Vercel Serverless Functions, Railway, or Render.
3. Configure environment variables in the deployment dashboard.
4. Ensure CORS origin matches frontend URL.
5. Confirm Cloudinary credentials are valid for media uploads.

---

## Challenges Faced & Learnings

- Implementing secure JWT refresh flows and token lifecycle management.
- Designing media upload and storage integration using Cloudinary.
- Structuring a scalable API with expressive route organization.
- Managing relationships between users, videos, comments, subscriptions, and playlists.
- Applying pagination and filtering for video listing performance.

---

## Future Improvements

- Add a React/Redux frontend for full MERN integration.
- Add validation and request-level sanitization middleware.
- Add test coverage with Jest and Supertest.
- Support adaptive video streaming and resumable uploads.
- Add search ranking, recommendations, and analytics dashboards.
- Add rate limiting and audit logging for production readiness.

---

## Contributing Guidelines

- Fork this repository and work on a feature branch.
- Keep commits small, descriptive, and meaningful.
- Use the existing code style and project conventions.
- Update or add documentation for new features.
- Submit pull requests with clear summaries and testing notes.

---

## License

This project is licensed under the **ISC License**.

---

## Contact

- GitHub: [Chitrakar09](https://github.com/Chitrakar09)
- Repository: [https://github.com/Chitrakar09/Youtube-Clone](https://github.com/Chitrakar09/Youtube-Clone)

---

## Professional Footer

VideoTube is built to demonstrate a scalable backend architecture for modern video platforms. It emphasizes clean API design, production-ready authentication, and media management workflows for real-world learning and portfolio use.
