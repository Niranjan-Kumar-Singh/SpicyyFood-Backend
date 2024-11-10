const express = require('express');
const {
  getAllCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { authenticateUser, isAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');
const fs = require('fs');

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Temporary storage

// Middleware to remove file after Cloudinary upload
const cleanupFile = (req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Failed to remove temp file:", err);
    });
  }
  next();
};

// Route to get all categories
router.get('/', getAllCategories);

// Route to add a new category
router.post('/', authenticateUser, isAdmin, upload.single('image'), addCategory, cleanupFile);

// Route to update an existing category
router.put('/:id', authenticateUser, isAdmin, upload.single('image'), updateCategory, cleanupFile);

// Route to delete a category
router.delete('/:id', authenticateUser, isAdmin, deleteCategory);

module.exports = router;
