import express from "express"
import { ERROR, SUCCESS } from "../constant.js"
import { addBook, deleteBooks, getBooks } from "../models/Book/BookModel.js"

const router = express.Router()

// get all books
router.get("/", async (req, res, next) => {
  try {
    const books = await getBooks()
    res.status(200).json({
      books: books.map((book) => ({
        ...book.toJSON(),
        availableQuantity: book.quantity - book.borrowedBy.length,
      })),
    })
  } catch (error) {
    next(error)
  }
})

// add a book
router.post("/", async (req, res, next) => {
  try {
    const book = await addBook(req.body)

    book?._id
      ? res.json({ status: SUCCESS, message: "Book added successfully!" })
      : res.json({
          status: ERROR,
          message: "Unable to add book. Please try again later!",
        })
  } catch (error) {
    next(error)
  }
})

// delete a book
router.delete("/", async (req, res, next) => {
  try {
    const del = await deleteBooks(req.body)

    console.log(del)

    del?.deletedCount
      ? res.json({
          status: "success",
          message: del.deletedCount + "book(s) deleted!",
        })
      : res.json({
          status: "error",
          message: "Unable to delete. Please try again later.",
        })
  } catch (error) {
    next(error)
  }
})

export default router
