import UserSchema from "./UserSchema.js"

// Create User
export const createUser = (userData) => {
  return UserSchema(userData).save()
}

// Get user
export const getUser = (userData) => {
  return UserSchema.findOne(userData)
}

export const getUserById = (_id) => {
  return UserSchema.findById(_id)
}

export const getUserByEmail = (email) => {
  return UserSchema.findOne({ email })
}

export const editUser = (userId, userData) => {
  return UserSchema.findByIdAndUpdate(userId, userData, { new: true })
}
