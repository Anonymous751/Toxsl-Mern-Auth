// =============================================
// src/pages/Register.jsx
// =============================================

// This page allows a new user to create an account.
// Features included:
// ✅ Name, Email, Password, Confirm Password
// ✅ Profile image upload with preview
// ✅ Password visibility toggle
// ✅ Animated UI with Framer Motion
// ✅ Toast notifications for success/error
// ✅ Back Button with animation transition
// =============================================

import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext"; // to access `register` function
import { motion } from "framer-motion"; // for animations
import { UploadCloud, Eye, EyeOff, UserPlus, ArrowLeft } from "lucide-react"; // icons
import { toast, ToastContainer } from "react-toastify"; // popup messages
import "react-toastify/dist/ReactToastify.css";
import { NavLink, useNavigate } from "react-router-dom"; // for navigation

export default function Register() {
  const { register } = useContext(AuthContext); // context register function
  const navigate = useNavigate(); // hook to navigate back

  // -----------------------------
  // Form state
  // -----------------------------
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    profileImage: null,
  });

  const [preview, setPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // -----------------------------
  // Handle input changes
  // -----------------------------
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      setForm({ ...form, [name]: files[0] });
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // -----------------------------
  // Handle form submission
  // -----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("❌ Passwords do not match!");
      return;
    }

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("email", form.email);
    fd.append("password", form.password);
    fd.append("confirm_password", form.confirmPassword);
    if (form.profileImage) fd.append("profileImage", form.profileImage);

    try {
      setLoading(true);
      const res = await register(fd);

      if (res.status === "success") {
        toast.success(res.message || "✅ Registration successful!");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      } else {
        toast.error(res.message || "❌ Registration failed!");
      }
    } catch (err) {
      toast.error("❌ Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // =============================================
  // UI (JSX)
  // =============================================
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-purple-900 via-pink-800 to-indigo-900 animate-gradient-x relative overflow-hidden">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Background animated circles */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600 rounded-full opacity-30 animate-pulse-slow blur-3xl"></div>
      <div className="absolute -bottom-40 -right-32 w-96 h-96 bg-pink-500 rounded-full opacity-30 animate-pulse-slow blur-3xl"></div>

      {/* Card container */}
      <motion.div
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative bg-white/10 backdrop-blur-lg border border-white/20 w-full max-w-md rounded-3xl shadow-2xl p-8 text-white"
      >
        {/* ✅ Back Button */}
        <motion.button
          whileHover={{ scale: 1.1, x: -5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)} // go back to previous page
          className="absolute top-4 left-4 flex items-center gap-2 text-white/70 hover:text-purple-400 transition-all"
        >
          <ArrowLeft size={22} />
          <span className="text-sm font-medium">Back</span>
        </motion.button>

        {/* Header */}
        <div className="flex flex-col items-center mb-6 mt-6">
          <UserPlus size={48} className="text-purple-400 mb-2 animate-bounce" />
          <h2 className="text-3xl font-extrabold text-center text-white">
            Create Account
          </h2>
          <p className="text-sm text-white/70 mt-1 text-center">
            Join us today! Just a few steps away.
          </p>
        </div>

        {/* ================== FORM ================== */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div className="relative">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-purple-400 rounded-xl bg-white/10 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-purple-400 text-white transition-all peer"
              required
            />
            <label className="absolute left-4 top-3 text-white/60 text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-[-8px] peer-focus:text-purple-400 peer-focus:text-sm transition-all">
              Full Name
            </label>
          </div>

          {/* Email */}
          <div className="relative">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-purple-400 rounded-xl bg-white/10 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-purple-400 text-white transition-all peer"
              required
            />
            <label className="absolute left-4 top-3 text-white/60 text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-[-8px] peer-focus:text-purple-400 peer-focus:text-sm transition-all">
              Email
            </label>
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-3 pr-12 border border-purple-400 rounded-xl bg-white/10 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-purple-400 text-white transition-all peer"
              required
            />
            <label className="absolute left-4 top-3 text-white/60 text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-[-8px] peer-focus:text-purple-400 peer-focus:text-sm transition-all">
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-purple-400 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 pr-12 border border-purple-400 rounded-xl bg-white/10 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-purple-400 text-white transition-all peer"
              required
            />
            <label className="absolute left-4 top-3 text-white/60 text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-[-8px] peer-focus:text-purple-400 peer-focus:text-sm transition-all">
              Confirm Password
            </label>
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-purple-400 transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Profile Image Upload */}
          <div className="relative">
            <input
              type="file"
              id="profileImage"
              name="profileImage"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
            />
            <motion.label
              htmlFor="profileImage"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative flex flex-col items-center justify-center w-full border-2 border-dashed border-purple-400 rounded-full p-4 cursor-pointer bg-white/10 hover:bg-purple-600/20 transition-all"
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-24 h-24 object-cover rounded-full shadow-lg transition-transform transform hover:scale-110"
                />
              ) : (
                <UploadCloud className="w-12 h-12 text-purple-400 mb-2 animate-bounce" />
              )}
              <span className="text-sm text-white/80 mt-2">
                {preview ? "Change Image" : "Click to Upload"}
              </span>
            </motion.label>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px #9f7aea" }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 bg-purple-600/90 text-white font-semibold py-3 rounded-2xl shadow-lg hover:bg-purple-700/90 transition-all ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Registering..." : "Register"}
            {!loading && <UserPlus size={20} />}
          </motion.button>
        </form>

        {/* Footer */}
        <p className="text-sm text-white/70 mt-6 text-center">
          Already have an account?{" "}
          <NavLink
            to="/login"
            className="text-purple-400 font-semibold hover:underline"
          >
            Login
          </NavLink>
        </p>
      </motion.div>
    </div>
  );
}
