import express from "express";
import UserController from "../myapp/User/controller/user.controller.js";
import protect from "../middleware/auth.middleware.js";
import upload from "../helpers/multer.conf.js";

const router = express.Router();

// Register + Email OTP
router.post("/register", upload.single("profileImage"), UserController.userRegistration);
router.post("/verify-otp", UserController.verifyEmailOTP);
router.post("/resend-otp", UserController.resendOTP);

// Login, Logout
router.post("/login", UserController.userLogin);
router.post("/logout", UserController.userLogout);

// Password Reset & Change
router.post("/send-reset-password-email", UserController.sendUserPasswordResetEmail);
router.post("/password-reset/:id/:token", UserController.userPasswordReset);
router.post("/reset-password-direct", UserController.resetPasswordDirectly);
router.post("/check-email", UserController.checkEmail);
router.post("/change-password-email", UserController.changePasswordByEmail);
router.post("/change-password", protect, UserController.changePassword);

// Logged user
router.get("/logged-user", protect, UserController.Loggeduser);

export default router;
