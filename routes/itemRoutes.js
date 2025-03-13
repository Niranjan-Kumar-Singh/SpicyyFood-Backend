const express = require('express');
const { authenticateUser, isAdmin } = require('../middleware/authMiddleware');
const { addItem, getAllItems, getItemsByCategory, updateItem, deleteItemById } = require('../controllers/itemController');
const upload = require('../middleware/multerConfig');

const router = express.Router();

// POST - Add new item
router.post('/', authenticateUser, isAdmin, upload.single('image'), addItem);

// GET - Retrieve all items with category names
router.get('/', getAllItems);

// GET - Retrieve items by category
router.get('/category/:categoryId', getItemsByCategory);

// PUT - Update item by ID
router.put('/:id', authenticateUser, isAdmin, upload.single('image'), updateItem);

// DELETE - Delete item by ID
router.delete('/:itemId', authenticateUser, isAdmin, deleteItemById);

module.exports = router;
