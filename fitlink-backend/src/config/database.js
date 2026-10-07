import mongoose from 'mongoose'
import { env } from './environment'

export const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI)
  } catch (error) {
    console.error('MongoDB connection failed:', error.message)
    process.exit(1)
  }
}


