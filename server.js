import dotenv from "dotenv"
dotenv.config()
import express from "express"
import cors from "cors"
import { ERROR } from "./src/constant.js"

const app = express()
const PORT = process.env.NODE_ENV || 8000

// Connect to MongoDB
import { connectDB } from "./src/config/db.js"
connectDB()

//middlewares
app.use(express.json())
app.use(cors())

//global error handler
app.use((error, req, res, next) => {
  console.log(error.message)

  const errorCode = error.errorCode || 500
  res.status(errorCode).json({
    status: ERROR,
    message: error.message,
  })
})

// Api routers
import userRouter from "./src/routers/userRouter.js"
import bookRouter from "./src/routers/bookRouter.js"
import transactionRouter from "./src/routers/transactionRouter.js"
import { isAuth } from "./src/middleware/authMiddleware.js"

app.use("/api/v1/user", userRouter)
app.use("/api/v1/book", isAuth, bookRouter)
app.use("/api/v1/transaction", isAuth, transactionRouter)

// all uncaught request
app.use("*", (req, res) => {
  res.json({
    message: "System status is healthy!",
  })
})

// run the server
app.listen(PORT, (error) => {
  error
    ? console.log(error)
    : console.log(`Server is running at http://localhost:${PORT}`)
})
