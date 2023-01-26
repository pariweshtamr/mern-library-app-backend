import express from "express"
import { ERROR, SUCCESS } from "../constant.js"
import { comparePassword, hashPassword } from "../helpers/bcrypt.helper.js"
import {
  createUser,
  editUser,
  getUser,
  getUserByEmail,
  getUserById,
} from "../models/User/UserModel.js"
const router = express.Router()

router.get("/", async (req, res, next) => {
  try {
    const user = await getUserById(req.headers.authorization)
    user.password = undefined
    res.json(user)
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
    const { email, password } = req.body
    const user = await getUser({ email })

    if (user?._id) {
      const isPassMatched = comparePassword(password, user.password)

      if (isPassMatched) {
        user.password = undefined
        return res.json({
          status: SUCCESS,
          message: "Login Successful",
          user,
        })
      }
    }
    res.json({ status: ERROR, message: "Error! Invalid Login Details." })
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

// Update password
router.patch("/password-update", async (req, res, next) => {
  try {
    const user = await getUserById(req.headers.authorization)
    const { currentPassword } = req.body

    const passMatched = comparePassword(currentPassword, user.password)
    if (passMatched) {
      const hashedPass = hashPassword(req.body.password)
      if (hashedPass) {
        const u = await editUser(user._id, { password: hashedPass })
        if (u?._id) {
          res.json({
            status: "success",
            message: "Password updated successfully!",
          })
          return
        }
        res.json({
          status: "error",
          message: "Unable to update password. Please try again later!",
        })
      }
    }
    res.json({
      status: "error",
      message: "Please enter the correct current password!",
    })
  } catch (error) {
    next(error)
  }
})

export default router
