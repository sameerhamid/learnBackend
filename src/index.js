// require('dotenv').config({ path: './env' })

import dotenv from 'dotenv'
import connectDB from './db/index.js';
import { app } from './app.js';

dotenv.config({
  path: './env'
})


connectDB().then(() => {
  app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running at Port ${process.env.PORT}`);
  })
}).catch(err => {
  console.log("monogo db connection failed !!! ", err);
})







/*
import express from 'express'
const URI = process.env.MONGODB_URI
const PORT = process.env.PORT

const app = express()

  ; (async () => {
    try {
      await mongoose.connect(`${URI}/${DB_NAME}`)
      app.on('error', (err => {
        console.log("Err", err);
        throw err
      }))
      app.listen(PORT, () => {
        console.log("App listining on port ", PORT);
      })
    } catch (err) {
      console.log("Error", err);
      throw err
    }
  })()

  */

