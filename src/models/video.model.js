import mongoose from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate'

const videoSchema = new mongoose.Schema({
  videoFile: {
    type: String, // cloudernary,
    required: true,
  },
  thumbnail: {
    type: String, // cloudernary,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  time: {
    type: Number, // clouderanry
  },
  views: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true })

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Vidoe", videoSchema)