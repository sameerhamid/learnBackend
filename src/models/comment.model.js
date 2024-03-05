import mongoose from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate'

const commentSchema = new mongoose.Schema({
  content: {
    tyep: String,
    required: true
  },
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video"
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true })


commentSchema.plugin(mongooseAggregatePaginate)

export const Comment = mongoose.Model("Comment", commentSchema)