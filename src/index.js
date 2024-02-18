// require('dotenv').config({ path: './env' })

import dotenv from 'dotenv'
import connectDB from './db/index.js';

dotenv.config({
  path: './env'
})


connectDB()







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

