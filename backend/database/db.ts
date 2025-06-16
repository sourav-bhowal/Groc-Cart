import mongoose from "mongoose";
import { MONGODB_URI } from "../config/config";

// This file is responsible for connecting to the MongoDB database using Mongoose.
export const connectDB = async () => {
  // Check if MONGODB_URI is defined
  if (!MONGODB_URI) {
    console.log("MongoDB URI is not defined in environment variables.");
    process.exit(1);
  }

  // Connect to MongoDB using Mongoose
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};
