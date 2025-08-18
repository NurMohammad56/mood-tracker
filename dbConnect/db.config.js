import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const URI = process.env.mongodb_URI; 

const dbconnect = async () => {
  try {
    await mongoose.connect(URI);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
  }
}

export default dbconnect;
  