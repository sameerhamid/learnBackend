import mongoose from 'mongoose'
import { DB_NAME } from '../constants.js'


const URI = process.env.MONGODB_URI

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${URI}/${DB_NAME}`)
    console.log(`MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
  } catch (err) {
    console.log("MondoDB connection error", err);
    process.exit(1)
  }
}

export default connectDB