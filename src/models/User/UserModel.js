import UserSchema from "./UserSchema.js"

// Create User
export const createUser = (userData) => {
  return UserSchema(userData).save()
}

// Get user
export const getUser = (userData) => {
  return UserSchema.findOne(userData)
}