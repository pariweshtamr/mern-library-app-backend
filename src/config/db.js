import mongoose from "mongoose"
export const connectDB = async () => {
  try {
    if (!process.env.MONGO_URL) {
      return console.log(
        "MONGO_CLIENT is not defined. Please create MONGO_CLIENT and provide a MongoDB connection string"
      )
    }

    mongoose.set("strictQuery", true)
    const conn = await mongoose.connect(process.env.MONGO_URL)

    conn
      ? console.log("Mongo DB Connected")
      : console.error("Unable to connect to Mongo DB")
  } catch (error) {
    console.log(error)
  }
}
