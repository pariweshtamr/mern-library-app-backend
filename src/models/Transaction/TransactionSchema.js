import mongoose from "mongoose"

const transactionSchema = new mongoose.Schema(
  {
    borrowedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    borrowedBook: {
      isbn: { type: String },
      thumbnail: { type: String },
      title: { type: String },
      author: { type: String },
      year: { type: Number },
    },
    returnDate: {
      type: Date,
    },
  },
  { timestamps: true }
)

export default mongoose.model("Transaction", transactionSchema)
