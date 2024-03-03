import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema({

  subscriber: {
    type: Schema.Types.ObjectId, // one who is subscibing
    ref: "User"
  },
  channel: {
    type: Schema.Types.ObjectId, //on to whom 'subcriber' is subscribing
    ref: "User"
  }

}, { timestamps: true })


export const Subscription = mongoose.model("Subscription", subscriptionSchema)