import express from "express"
import { ERROR, SUCCESS } from "../constant.js"
import {
  findBookAndUpdate,
  getBook,
  getBooksBorrowedByUser,
} from "../models/Book/BookModel.js"
import { createUser, getUser, getUserById } from "../models/User/UserModel.js"
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

// borrow book
router.post("/borrow", async (req, res, next) => {
  try {
    const bookId = req.body.bookId
    const book = await getBook({ _id: bookId })
    const user = await getUserById({ _id: req.body.userId })

    if (book?._id && user._id) {
      if (book.borrowedBy.includes(user._id)) {
        return res
          .status(200)
          .json({ message: "You have already borrowed this book!" })
      }
    }

    const updateBook = await findBookAndUpdate(bookId, {
      borrowedBy: [...book.borrowedBy, user._id],
    })

    updateBook._id
      ? res.json({
          status: SUCCESS,
          message: "You have borrowed this book!",
          book: {
            ...updateBook.toJSON(),
            availableQuantity:
              updateBook.quantity - updateBook.borrowedBy.length,
          },
        })
      : res.json({
          status: ERROR,
          message: "Something went wrong! Please try again later.",
        })
  } catch (error) {
    next(error)
  }
})

// return book
router.patch("/return", async (req, res, next) => {
  try {
    const bookId = req.body.bookId
    const userId = req.body.userId
    const book = await getBook({ _id: bookId })
    const user = await getUserById(userId)

    const updateBook = await findBookAndUpdate(bookId, {
      $pull: { borrowedBy: user._id },
    })
    console.log(updateBook)
    updateBook._id
      ? res.json({
          status: SUCCESS,
          message: "You have returned this book!",
          book: {
            ...updateBook.toJSON(),
          },
        })
      : res.json({
          status: ERROR,
          message: "Unable to return book! Please try again later.",
        })
  } catch (error) {
    next(error)
  }
})

// get borrowed books by user
router.get("/borrowed-books", async (req, res, next) => {
  try {
    const result = await getBooksBorrowedByUser(req.headers.authorization)
    return res.status(200).json({ books: result })
  } catch (error) {
    next(error)
  }
})

export default router
