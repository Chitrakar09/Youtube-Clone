//method 1 to connect DB: directly in index.js

/*
import mongoose from 'mongoose';
import { DB_NAME } from './constants.js';
import express from "express"

const app= express();

(async()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        app.on("error",(error)=>{
            console.log("Error", error);
            throw error
        })
        app.listen(process.env.PORT,()=>{
            console.log(`App is listening on port ${process.env.PORT}`);
            
        })
    } catch (error) {
        console.error("Error:",error);
        throw error;
    }
})()
*/

//method 2: connection to DB code from another file and referencing in index.js

import '@dotenvx/dotenvx/config'
import connectDB from "./db/index.js";
import { app } from "./app.js";

const port = process.env.PORT || 8000;

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("Error", error);
      throw error;
    });
    app.listen(port, () => {
      console.log(`App is listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Error: ", error);
    throw error;
  });
