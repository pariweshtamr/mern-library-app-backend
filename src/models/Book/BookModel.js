import BookSchema from "./BookSchema.js"

// Add Book
export const addBook = (bookInfo) => {
  return BookSchema(bookInfo).save()
}

// Get Books
export const getBooks = () => {
  return BookSchema.find()
}

// Get a book by id
export const getBook = (_id) => {
  return BookSchema.findById(_id)
}

// Get books by user
export const getBooksBorrowedByUser = (userId) => {
  return BookSchema.find({ borrowedBy: { $in: userId } })
}

// update book
export const findBookAndUpdate = (_id, obj) => {
  return BookSchema.findByIdAndUpdate(_id, obj, { new: true })
}

// delete books
export const deleteBooks = (ids) => {
  return BookSchema.deleteMany({
    _id: {
      $in: ids,
    },
  })
}
export const deleteBook = (_id) => {
  return BookSchema.findByIdAndDelete(_id)
}
