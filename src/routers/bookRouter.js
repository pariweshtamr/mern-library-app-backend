import express from "express"
import { ERROR, SUCCESS } from "../constant.js"
import {
  addBook,
  deleteBook,
  deleteBooks,
  findBookAndUpdate,
  getBook,
  getBooks,
  getBooksBorrowedByUser,
} from "../models/Book/BookModel.js"
import {
  findTransactionByIdAndUpdate,
  getTransactionByQuery,
  postTransaction,
} from "../models/Transaction/TransactionModel.js"
import { getUserById } from "../models/User/UserModel.js"

const router = express.Router()

// get all books
router.get("/", async (req, res, next) => {
  try {
    const books = await getBooks()
    res.status(200).json({ books })
    // res.status(200).json({
    //   books: books.map((book) => ({
    //     ...book.toJSON(),
    //     availableQuantity: book.quantity - book.borrowedBy.length,
    //   })),
  } catch (error) {
    next(error)
  }
})

// get books borrowed by specific user
router.get("/borrowedByUser", async (req, res, next) => {
  try {
    const result = await getBooksBorrowedByUser(req.headers.authorization)

    return res.status(200).json({ books: result })
  } catch (error) {
    next(error)
  }
})

// get all books that have been borrowed by users
router.get("/allBorrowedBooks", async (req, res, next) => {})

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
router.delete("/delete", async (req, res, next) => {
  try {
    const del = await deleteBook(req.body._id)

    del?._id
      ? res.json({
          status: SUCCESS,
          message: "book deleted",
        })
      : res.json({
          status: ERROR,
          message: "Unable to delete book. Please try again later!",
        })
  } catch (error) {
    next(error)
  }
})

// delete multiple books
router.delete("/", async (req, res, next) => {
  try {
    const del = await deleteBooks(req.body)

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

// borrow book
router.post("/borrow", async (req, res, next) => {
  try {
    const bookId = req.body.bookId
    const { authorization } = req.headers
    const book = await getBook({ _id: bookId })
    const user = await getUserById(authorization)

    if (book?._id && user._id) {
      if (book.borrowedBy.length) {
        if (book.borrowedBy.includes(user?._id)) {
          return res.json({
            status: "error",
            message: "You have already borrowed this book.",
          })
        }
        return res.json({
          status: ERROR,
          message:
            "This is has already been borrowed and will be available once it has been returned.",
        })
      }
      // if (book.borrowedBy.includes(user._id)) {
      //   return res
      //     .status(200)
      //     .json({ message: "You have already borrowed this book!" })
      // }
    }

    const transaction = await postTransaction({
      borrowedBy: {
        userId: user?._id,
        userFname: user?.fName,
        userLname: user?.lName,
      },
      borrowedBook: {
        isbn: book.isbn,
        thumbnail: book.thumbnail,
        title: book.title,
        author: book.author,
        year: book.year,
      },
    })

    if (transaction?._id) {
      const updateBook = await findBookAndUpdate(bookId, {
        borrowedBy: [...book.borrowedBy, user._id],
      })

      return updateBook._id
        ? res.json({
            status: SUCCESS,
            message: "You have borrowed this book!",
            // book: {
            //   ...updateBook.toJSON(),
            //   availableQuantity:
            //     updateBook.quantity - updateBook.borrowedBy.length,
            // },
          })
        : res.json({
            status: ERROR,
            message: "Something went wrong! Please try again later.",
          })
    }
  } catch (error) {
    next(error)
  }
})

// return book
router.patch("/return", async (req, res, next) => {
  try {
    const bookId = req.body.bookId
    const { authorization } = req.headers
    const user = await getUserById(authorization)
    const book = await getBook(bookId)

    const transaction = await getTransactionByQuery(authorization, book.isbn)

    if (transaction) {
      const updateTransaction = await findTransactionByIdAndUpdate(
        transaction?._id,
        {
          returnDate: new Date(),
        }
      )
      console.log(updateTransaction)
      if (updateTransaction?.returnDate) {
        const updateBook = await findBookAndUpdate(bookId, {
          $pull: { borrowedBy: user._id },
        })
        return updateBook._id
          ? res.json({
              status: SUCCESS,
              message: "You have returned this book!",
              // book: {
              //   ...updateBook.toJSON(),
              // },
            })
          : res.json({
              status: ERROR,
              message: "Unable to return book! Please try again later.",
            })
      }
    }
  } catch (error) {
    next(error)
  }
})

export default router
