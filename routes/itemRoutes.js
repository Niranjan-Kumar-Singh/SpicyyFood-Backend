const express = require('express');
const { authenticateUser, isAdmin } = require('../middleware/authMiddleware');
const { addItem, getAllItems, updateItem, deleteItemById } = require('../controllers/itemController');
const upload = require('../middleware/multerConfig');

const router = express.Router();

// Define routes
router.post('/', authenticateUser, isAdmin, upload.single('image'), addItem); // POST - Add new item
router.get('/', getAllItems);                                         // GET - Retrieve all items
router.put('/:id', authenticateUser, isAdmin, upload.single('image'), updateItem); // PUT - Update item by ID
router.delete('/:itemId', authenticateUser, isAdmin, deleteItemById);           // DELETE - Delete item by ID

module.exports = router;
