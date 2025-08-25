// ==============================
// Import Dependencies
// ==============================
import createError from "http-errors"; // For handling errors (404, etc.)
import express from "express"; // Express framework
import cookieParser from "cookie-parser"; // To parse cookies
import logger from "morgan"; // HTTP request logger
import { fileURLToPath } from "url"; // To get file paths in ES modules
import { dirname, join } from "path"; // To work with file/directory paths
import dotenv from "dotenv"; // To load environment variables
import usersRouter from "./routes/users.js"; // User routes
import path from "path"; // Node.js path module
import connectDB from "./config/db/db.connect.js"; // MongoDB connection function
import cors from "cors"; // To allow cross-origin requests (frontend ↔ backend)

// ==============================
// Path Setup (for __dirname in ES Modules)
// ==============================
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ==============================
// Initialize App
// ==============================
const app = express();
dotenv.config(); // Load .env file

// ==============================
// Database Connection
// ==============================
const DATABASE_URI = process.env.DATABASE_URI;
connectDB(DATABASE_URI); // Connect to MongoDB

// ==============================
// Middleware
// ==============================

// ✅ CORS (Allow frontend at localhost:5173 to communicate with backend)
// - credentials: true → allows cookies (for JWT auth)
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ✅ Logger (logs requests in console: GET /users 200 etc.)
app.use(logger("dev"));

// ✅ Parse incoming JSON data (req.body)
app.use(express.json());

// ✅ Parse form data (application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: false }));

// ✅ Parse cookies from request headers
app.use(cookieParser());

// ==============================
// Static Files (Public Access)
// ==============================

// Serve uploaded files (images, etc.)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Alternative path (in case of process.cwd())
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ==============================
// Routes
// ==============================
// All user-related routes will start with /users
// Example: /users/register, /users/login, etc.
app.use("/users", usersRouter);

// ==============================
// Error Handling
// ==============================

// 1. Catch 404 errors (route not found)
app.use((req, res, next) => {
  next(createError(404));
});

// 2. Global Error Handler
app.use((err, req, res, next) => {
  // Provide error message
  res.locals.message = err.message;

  // Show full error stack in development only
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Set status code (default 500 if not provided)
  res.status(err.status || 500);

  // Send JSON error response
  res.json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
});

// ==============================
// Export App
// ==============================
export default app;
