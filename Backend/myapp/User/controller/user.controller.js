// ==============================
// Import Dependencies & Helpers
// ==============================
import userModel from "../models/user.models.js"; // User model
import {
  hashPassword,
  comparePassword,
} from "../../../helpers/jwt.password.js"; // Password utilities
import { generateToken, verifyToken } from "../../../helpers/jwt.helper.js"; // JWT utilities
import { generateOTP, sendOTPEmail } from "../../../helpers/otp.helper.js"

// ==============================
// User Controller
// ==============================
class UserController {
  // ------------------------------
  // REGISTER USER
  // ------------------------------



  // REGISTER USER (send OTP + profileImage upload)
static userRegistration = async (req, res) => {
  try {
    const { name, email, password, confirm_password } = req.body;

    if (!name || !email || !password || !confirm_password)
      return res.status(400).json({ message: "All fields are required" });

    if (password !== confirm_password)
      return res.status(400).json({ message: "Passwords do not match" });

    const existingUser = await userModel.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await hashPassword(password);

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 50 * 60 * 1000); // 50 mins

    // ✅ Handle profile image (if uploaded)
    const profileImage = req.file ? req.file.path : null;

    const newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpires,
      isVerified: false,
      profileImage, // 👈 save file path in DB
    });

    await sendOTPEmail(email, otp);

    res.status(201).json({
      status: "success",
      message: "User registered. Please verify your email via OTP.",
      userId: newUser._id,
      profileImage: profileImage
        ? `http://localhost:3000/${profileImage.replace(/\\/g, "/")}`
        : null,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


  // ------------------------------
  // VERIFY EMAIL WITH OTP
  // ------------------------------
static verifyEmailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isVerified)
      return res.status(400).json({ message: "User already verified" });

    if (user.otp !== otp || user.otpExpires < Date.now())
      return res.status(400).json({ message: "Invalid or expired OTP" });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ status: "success", message: "Email verified successfully" });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ========================
  // RESEND OTP
  // ===========================

  static resendOTP = async (req, res) => {
    try {
      const { email } = req.body;

      const user = await userModel.findOne({ email });
      if (!user) return res.status(404).json({ message: "User not found" });

      if (user.isVerified)
        return res.status(400).json({ message: "User already verified" });

      const otp = generateOTP();
      user.otp = otp;
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      await sendOTPEmail(email, otp);

      res.json({ status: "success", message: "OTP resent successfully" });
    } catch (error) {
      console.error("Resend OTP error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

// ==============================
  // LOGIN USER (only if verified)
  // ===============================
  static userLogin = async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password)
        return res.status(400).json({ message: "Email and password required" });

      const user = await userModel.findOne({ email });
      if (!user)
        return res.status(404).json({ message: "User not registered" });

      if (!user.isVerified)
        return res
          .status(403)
          .json({ message: "Please verify your email before login" });

      const isMatch = await comparePassword(password, user.password);
      if (!isMatch)
        return res.status(400).json({ message: "Invalid credentials" });

      const token = generateToken(user._id);

      res
        .cookie("token", token, {
          httpOnly: true,
          secure: false,
          maxAge: 24 * 60 * 60 * 1000,
          sameSite: "Lax",
        })
        .json({
          status: "success",
          message: "Login successful",
           token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            profileImage: user.profileImage,
          },
        });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ message: "Login failed" });
    }
  };

  // ------------------------------
  // LOGOUT USER
  // ------------------------------
  static userLogout = async (req, res) => {
    try {
      res
        .cookie("token", "", {
          httpOnly: true,
          expires: new Date(0), // Expire immediately
          sameSite: "Lax",
        })
        .json({ status: "success", message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ status: "error", message: "Logout failed" });
    }
  };

  // ------------------------------
  // CHECK IF EMAIL EXISTS
  // ------------------------------
  static checkEmail = async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          status: "error",
          message: "Email is required",
        });
      }

      const user = await userModel.findOne({ email });

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "Email not found",
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Email exists",
        user: { id: user._id, email: user.email },
      });
    } catch (err) {
      console.error("Check email error:", err);
      return res.status(500).json({
        status: "error",
        message: "Server error",
      });
    }
  };

  // ------------------------------
  // CHANGE PASSWORD (LOGGED-IN USER)
  // ------------------------------
  static changePassword = async (req, res) => {
    try {
      const { password, confirm_password } = req.body;

      // Validation
      if (!password || !confirm_password) {
        return res.status(400).json({ message: "All fields are required" });
      }
      if (password !== confirm_password) {
        return res.status(400).json({ message: "Passwords do not match" });
      }

      // Update password
      const newHashedPassword = await hashPassword(password);
      await userModel.findByIdAndUpdate(req.user._id, {
        password: newHashedPassword,
      });

      res.json({ status: "success", message: "Password updated" });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({ message: "Unable to change password" });
    }
  };

  // ------------------------------
  // GET LOGGED-IN USER INFO
  // ------------------------------
  static Loggeduser = async (req, res) => {
    try {
      const user = req.user; // fetched from auth middleware
      res.json({
        status: "success",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          profileImage: user.profileImage
            ? `http://localhost:3000/${user.profileImage.replace(/\\/g, "/")}`
            : "",
        },
      });
    } catch (err) {
      console.error("Fetch user error:", err);
      res
        .status(500)
        .json({ status: "error", message: "Failed to fetch user" });
    }
  };

  // ------------------------------
  // SEND RESET PASSWORD EMAIL (MOCKED WITH CONSOLE)
  // ------------------------------
  static sendUserPasswordResetEmail = async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) return res.status(400).json({ message: "Email is required" });

      const user = await userModel.findOne({ email });
      if (!user)
        return res.status(404).json({ message: "Email does not exist" });

      // Generate token (1 hour expiry)
      const token = generateToken(user._id, "1h");

      // Simulate sending email (print to console)
      console.log(
        `Password reset link: http://127.0.0.1:3000/users/reset/${user._id}/${token}`
      );

      res.json({
        status: "success",
        message: "Password reset link generated (check console)",
      });
    } catch (error) {
      console.error("Password reset email error:", error);
      res.status(500).json({ message: "Something went wrong" });
    }
  };

  // ------------------------------
  // CHANGE PASSWORD BY EMAIL (with old password check)
  // ------------------------------
  static changePasswordByEmail = async (req, res) => {
    try {
      const { email, oldPassword, newPassword } = req.body;

      // Validation
      if (!email || !oldPassword || !newPassword) {
        return res
          .status(400)
          .json({ status: "error", message: "All fields are required" });
      }

      const user = await userModel.findOne({ email });
      if (!user) {
        return res
          .status(404)
          .json({ status: "error", message: "User not found" });
      }

      // Verify old password
      const isMatch = await comparePassword(oldPassword, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ status: "error", message: "Old password is incorrect" });
      }

      // Save new password
      user.password = await hashPassword(newPassword);
      await user.save();

      return res.json({
        status: "success",
        message: "Password updated successfully",
      });
    } catch (err) {
      console.error("Change password by email error:", err);
      return res.status(500).json({ status: "error", message: "Server error" });
    }
  };

  // ------------------------------
  // RESET PASSWORD DIRECTLY (WITHOUT TOKEN)
  // ------------------------------
  static resetPasswordDirectly = async (req, res) => {
    try {
      console.log("Received reset request:", req.body);

      const { email, password, confirm_password } = req.body;

      // Validation
      if (!email || !password || !confirm_password) {
        return res
          .status(400)
          .json({ status: "error", message: "All fields are required" });
      }
      if (password !== confirm_password) {
        return res
          .status(400)
          .json({ status: "error", message: "Passwords do not match" });
      }

      // Find user
      const user = await userModel.findOne({ email });
      if (!user) {
        return res
          .status(404)
          .json({ status: "error", message: "User not found" });
      }

      // Update password
      const hashed = await hashPassword(password);
      await userModel.findByIdAndUpdate(user._id, { password: hashed });

      console.log("Password updated successfully for:", user.email);

      return res.json({
        status: "success",
        message: "Password reset successful",
      });
    } catch (err) {
      console.error("Reset password directly error:", err);
      return res
        .status(500)
        .json({ status: "error", message: "Password reset failed" });
    }
  };

  // ------------------------------
  // RESET PASSWORD USING TOKEN & ID
  // ------------------------------
  static userPasswordReset = async (req, res) => {
    try {
      const { password, confirm_password } = req.body;
      const { id, token } = req.params;

      // 1. Find user
      const user = await userModel.findById(id);
      if (!user) return res.status(404).json({ message: "User not found" });

      // 2. Verify token
      verifyToken(token);

      // 3. Validate
      if (!password || !confirm_password) {
        return res.status(400).json({ message: "All fields are required" });
      }
      if (password !== confirm_password) {
        return res.status(400).json({ message: "Passwords do not match" });
      }

      // 4. Save new password
      const hashed = await hashPassword(password);
      await userModel.findByIdAndUpdate(user._id, { password: hashed });

      res.json({ status: "success", message: "Password reset successful" });
    } catch (error) {
      console.error("Token reset error:", error);
      res.status(400).json({ message: "Invalid or expired token" });
    }
  };
}

// ==============================
// Export Controller
// ==============================
export default UserController;
