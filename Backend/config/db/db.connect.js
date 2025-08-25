// Import mongoose library for MongoDB connection
import mongoose from "mongoose";

/**
 * Connects to MongoDB database using Mongoose
 * @param {string} DATABASE_URI - MongoDB connection string (from .env file)
 */
const connectDB = async (DATABASE_URI) => {
  try {
    // Options for database connection
    const DB_OPTIONS = {
      dbName: "AuthShop", // This is the name of the database
    };

    // Connect to MongoDB
    await mongoose.connect(DATABASE_URI, DB_OPTIONS);

    // Success message in console
    console.log("✅ MongoDB Connected Successfully!");
  } catch (error) {
    // If something goes wrong, log the error
    console.error("❌ MongoDB Connection Failed:", error.message);
    process.exit(1); // Stop the app if DB is not connected
  }
};

// Export function to use in app.js
export default connectDB;
