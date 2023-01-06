import mongoose, { Schema } from "mongoose"

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    borrowedBy: [{ type: Schema.Types.ObjectId, ref: "users" }],
    quantity: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
)

export default mongoose.model("Book", bookSchema)
