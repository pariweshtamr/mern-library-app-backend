import express from "express"
import { ERROR, SUCCESS } from "../constant.js"
import { createUser, getUser } from "../models/User/UserModel.js"
const router = express.Router()

router.get("/", (req, res, next) => {
  try {
    res.json({
      status: SUCCESS,
      message: "todo get user",
    })
  } catch (error) {
    next(error)
  }
})

// Create new user
router.post("/", async (req, res, next) => {
  try {
    const result = await createUser(req.body)

    result?._id
      ? res.json({
          status: SUCCESS,
          message: "User has been created successfully. You may now log in!",
        })
      : res.json({
          status: ERROR,
          message: "User has not been created. Please try again!",
        })
  } catch (error) {
    if (error.message.includes("E11000 duiplicate key")) {
      res.json({
        status: SUCCESS,
        message: "An account using this email already exists. Please log in!",
      })
    }
    next(error)
  }
})

// Login user
router.post("/login", async (req, res, next) => {
  try {
    const { email } = req.body
    const user = await getUser({ email })

    user.password = undefined

    user?._id
      ? res.json({
          status: SUCCESS,
          message: "Login Successful",
          user,
        })
      : res.json({ status: ERROR, message: "Error! Invalid Login Details." })
  } catch (error) {
    next(error)
  }
})

export default router
