import { verifyToken } from "../helpers/jwt.helper.js";
import userModel from "../myapp/User/models/user.models.js";

/**
 * ================================
 * Authentication Middleware
 * ================================
 * Protects routes by validating JWT token.
 * 
 * 1. Reads token from Authorization header.
 * 2. Verifies token & decodes user ID.
 * 3. Attaches user info (without password) to `req.user`.
 * 4. If invalid/missing → returns 401 Unauthorized.
 * 
 * Usage:
 *   app.get("/protected", protect, (req, res) => { ... });
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // ✅ Check if authorization header contains a Bearer token
    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1]; // Extract token
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "❌ No token, authorization denied" });
    }

    // ✅ Verify and decode token
    const decoded = verifyToken(token);

    if (!decoded?.userId) {
      return res.status(401).json({ success: false, message: "❌ Invalid token payload" });
    }

    // ✅ Fetch user (without password) from DB
    const user = await userModel.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ success: false, message: "❌ User not found" });
    }

    // Attach user to request object
    req.user = user;

    next(); // Continue to next middleware/controller
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    return res.status(401).json({ success: false, message: "❌ Not authorized, token failed" });
  }
};

export default protect;
