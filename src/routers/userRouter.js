import express from "express"
import { ERROR, SUCCESS } from "../constant.js"
import { hashPassword } from "../helpers/bcrypt.helper.js"
import {
  createUser,
  editUser,
  getUser,
  getUserByEmail,
  getUserById,
} from "../models/User/UserModel.js"
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
  const { email } = req.body
  try {
    const userExists = await getUserByEmail(email)
    if (userExists) {
      return res.json({
        status: "error",
        message: "User already exists! Please Log in.",
      })
    }

    // encrypt password
    const hashPass = hashPassword(req.body.password)

    if (hashPass) {
      req.body.password = hashPass
      const result = await createUser(req.body)

      if (result?._id) {
        return res.json({
          status: SUCCESS,
          message: "User has been created successfully. You may now log in!",
        })
      }
      return res.json({
        status: ERROR,
        message: "User has not been created. Please try again!",
      })
    }
  } catch (error) {
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

// Edit user
router.patch("/", async (req, res, next) => {
  try {
    const { authorization } = req.headers

    const updatedUser = await editUser(authorization, req.body)

    if (updatedUser?._id) {
      return res.json({
        status: SUCCESS,
        message: "User info updated successfully!",
      })
    }
    res.json({
      status: ERROR,
      message: "Unable to update user information. Please try agina later!",
    })
  } catch (error) {
    next(error)
  }
})

export default router
