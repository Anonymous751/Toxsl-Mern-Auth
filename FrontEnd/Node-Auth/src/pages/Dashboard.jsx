// =============================================
// src/pages/Dashboard.jsx
// =============================================



import { useContext } from "react";
import { AuthContext } from "../context/AuthContext"; // Importing our authentication context
import { motion } from "framer-motion"; // For smooth animations
import { LogOut, KeyRound } from "lucide-react"; // Icons for buttons
import { useNavigate } from "react-router-dom"; // To navigate between pages

const Dashboard = () => {
  // Get "user" data and "logout" function from our AuthContext
  const { user, logout } = useContext(AuthContext);

  // React Router hook to navigate programmatically
  const navigate = useNavigate();

  // If no user is logged in, show a message
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900 text-white">
        {/* Animated text using Framer Motion */}
        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-lg"
        >
          Please login to see your dashboard
        </motion.p>
      </div>
    );
  }

  // If user has uploaded profile image use that, otherwise use default image
  const profileImageUrl = user.profileImage || "/default-profile.png";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900 flex flex-col items-center p-6 text-white relative overflow-hidden">
      {/* Floating background glowing circles */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl animate-pulse"></div>

      {/* Welcome Heading */}
      <motion.h1
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-4xl font-extrabold mb-6 drop-shadow-lg"
      >
        Welcome, <span className="text-yellow-300">{user.name}</span> 👋
      </motion.h1>

      {/* Buttons Section */}
      <div className="flex gap-4 mb-8">
        {/* Logout button */}
        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: "#ef4444" }}
          whileTap={{ scale: 0.95 }}
          onClick={logout} // Calls logout function from context
          className="flex items-center gap-2 bg-red-500 px-5 py-2 rounded-full shadow-lg hover:bg-red-600 transition-colors"
        >
          <LogOut size={20} />
          Logout
        </motion.button>

        {/* Change Password button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/change-password")} // Navigate to change password page
          className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-2 rounded-full shadow-lg text-white font-semibold transition-all hover:shadow-[0_0_20px_rgba(236,72,153,0.7)]"
        >
          <KeyRound size={20} />
          Change Password
        </motion.button>
      </div>

      {/* Profile Card (User Details) */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9 }}
        className="relative bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 w-full max-w-3xl"
      >
        {/* Profile Picture */}
        <motion.img
          whileHover={{ scale: 1.1, rotate: 2 }}
          src={profileImageUrl}
          alt="Profile"
          className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-lg"
        />

        {/* Show User Info */}
        <div className="flex flex-col gap-3 text-white text-lg w-full">
          {Object.keys(user).map((key, idx) => {
            // Skip profile image & password (we don't want to show these)
            if (["profileImage", "password"].includes(key)) return null;

            return (
              <motion.p
                key={key}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * idx, duration: 0.5 }}
              >
                {/* Show each key with capitalized first letter */}
                <span className="font-semibold text-yellow-300">
                  {key.charAt(0).toUpperCase() + key.slice(1)}:
                </span>{" "}
                {String(user[key])}
              </motion.p>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
