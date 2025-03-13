const express = require('express');
const {
  getAllCategories,
  getCategoriesOnly,
  addCategory,
  updateCategory,
  deleteCategory,
  getCategoryById,
} = require('../controllers/categoryController');
const { authenticateUser, isAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Route to get all categories with items
router.get('/', getAllCategories);

// Route to get only category names and IDs
router.get('/names', getCategoriesOnly);

// Route to add a new category
router.post('/', authenticateUser, isAdmin, upload.single('image'), addCategory);

// Route to update an existing category
router.put('/:id', authenticateUser, isAdmin, upload.single('image'), updateCategory);

// Route to delete a category
router.delete('/:id', authenticateUser, isAdmin, deleteCategory);

// Route to get category by ID
router.get('/:id', getCategoryById);

module.exports = router;
