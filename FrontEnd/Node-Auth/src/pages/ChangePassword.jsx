// ================================
// src/pages/ChangePassword.jsx
// ================================
// ✅ This component allows a user to verify their email
//    before redirecting them to a page where they can 
//    actually reset their password.
// -------------------------------

// React imports
import { useState } from "react"; // For managing form state (email, loading)
import { motion } from "framer-motion"; // For smooth animations
import { toast, ToastContainer } from "react-toastify"; // For showing notifications
import "react-toastify/dist/ReactToastify.css"; // Default styles for toast notifications
import { useNavigate } from "react-router-dom"; // For programmatic navigation
import axios from "axios"; // For making HTTP requests to the backend
import { ArrowLeft } from "lucide-react";


const ChangePassword = () => {

  // -------------------------------
  // Local state
  // -------------------------------
  const [email, setEmail] = useState(""); // Store the entered email
  const [loading, setLoading] = useState(false); // Track if the request is loading
  const navigate = useNavigate(); // Hook to redirect user to another route

  // -------------------------------
  // Handle form submit
  // -------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload on form submit

    // ✅ Validation: Check if email is empty
    if (!email) {
      toast.error("⚠️ Please enter your email!", { position: "top-right" });
      return;
    }

    try {
      setLoading(true); // Start loading spinner

      // ✅ Send request to backend to check if email exists
      // (This assumes your backend has an endpoint: POST /users/check-email)
      const res = await axios.post("http://localhost:3000/users/check-email", {
        email,
      });

      // ✅ Check backend response
      if (res.data.status === "success") {
        // If email exists
        toast.success("✅ Email verified! Redirecting...", {
          position: "top-right",
        });

        // Redirect after short delay to reset page
        setTimeout(() => {
          // Passing email to next page using React Router `state`
          navigate("/change-password-reset", { state: { email } });
        }, 1200);
      } else {
        // If backend says email not registered
        toast.error("❌ Email not registered!", { position: "top-right" });
      }
    } catch (err) {
      console.error("Error checking email:", err);

      // ✅ Handle error messages properly
      if (err.response && err.response.data?.message) {
        toast.error(`❌ ${err.response.data.message}`, {
          position: "top-right",
        });
      } else {
        toast.error("⚠️ Something went wrong. Try again!", {
          position: "top-right",
        });
      }
    } finally {
      setLoading(false); // ✅ Always stop loading, success or error
    }
  };

  // -------------------------------
  // UI (JSX)
  // -------------------------------
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white">
      {/* Animated container using Framer Motion */}
      <motion.div
        initial={{ opacity: 0, y: 50 }} // start animation (invisible, moved down)
        animate={{ opacity: 1, y: 0 }} // end animation (visible, in position)
        transition={{ duration: 0.6 }} // animation speed
        className="bg-white/10 backdrop-blur-lg shadow-2xl rounded-2xl p-8 w-full max-w-md"
      >
         <motion.button
                  whileHover={{ scale: 1.1, x: -5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => navigate(-1)} // go back to previous page
                  className="absolute top-4 left-4 flex items-center gap-2 text-white/70 hover:text-purple-400 transition-all"
                >
                  <ArrowLeft size={22} />
                  <span className="text-sm font-medium">Back</span>
                </motion.button>
        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-yellow-300 mb-6">
          Change Password
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <input
            type="email"
            placeholder="Enter your registered Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Update email state
            required
            className="w-full px-4 py-2 border border-white/30 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading} // Disable button while loading
            className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-yellow-400 to-pink-500 text-white font-semibold shadow-lg transition duration-300 hover:scale-105 disabled:opacity-50"
          >
            {/* Change button text depending on loading state */}
            {loading ? "Checking..." : "Send Reset Link"}
          </button>
        </form>

        {/* Helper text */}
        <p className="mt-4 text-xs text-gray-300 text-center">
          ⚠️ Important: Only registered users can reset their password.
        </p>
      </motion.div>

      {/* Toast notifications container */}
      <ToastContainer />
    </div>
  );
};

export default ChangePassword;
