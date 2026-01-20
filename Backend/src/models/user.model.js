import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is Required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // for optimization; learn more about it
    },
    email: {
      type: String,
      required: [true, "Email is Required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, "Full Name is Required"],
      trim: true,
      index: true,
    },
    avatar: {
      type: String, //cloudinary url
      required:[true,"Avatar is Required"]
    },
    coverImage: {
      type: String, //cloudinary url
    },
    password: {
      type: String,
      required: [true, "Password is Required"],
    },
    watchedHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);


// middleware in mongoose that hashes (encrypts password) before saving password into db using bcrypt
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return // if the password is not changed then return
  try {
    this.password = await bcrypt.hash(this.password, 10);
  } catch (error) {
    console.error("Error hashing password:",err)
    throw err
  }
});

// custom methods provided my mongoose to compare passwords using bcrypt
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// generating AccessToken and RefreshToken using JWT
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {   //payload
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET, // secret key
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY } //validity time period
  );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
    {   //payload
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET, //secret key
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY } // validity time period
  );
};


export const User = mongoose.model("User", userSchema);
