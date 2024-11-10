const express = require("express");
const router = express.Router();
const { authenticateUser, isAdmin } = require("../middleware/authMiddleware");
const {
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteUser,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
} = require("../controllers/userController");

router.route("/profile")
  .get(authenticateUser, getUserProfile)       // View profile
  .put(authenticateUser, updateUserProfile);    // Update profile

// Using controller function directly for password change
router.put("/profile/change-password", authenticateUser, changePassword);

router.delete("/profile/delete", authenticateUser, async (req, res) => {
  try {
    await deleteUser(req, res);  // Controller function to delete the user
  } catch (error) {
    res.status(500).json({ message: "Error deleting user account" });
  }
});

// Admin Routes
router.get("/all", authenticateUser, isAdmin, async (req, res) => {
  try {
    await getAllUsers(req, res);  // Controller function for admin access
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

router.route("/:userId")
  .get(authenticateUser, isAdmin, getUserById)   // Admin only route
  .put(authenticateUser, isAdmin, updateUserById) // Admin only route
  .delete(authenticateUser, isAdmin, deleteUserById); // Admin only route

module.exports = router;
