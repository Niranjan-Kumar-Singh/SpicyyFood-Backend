const express = require('express');
const { getCart, addToCart, removeFromCart, updateCartQuantity } = require('../controllers/cartController');
const { authenticateUser } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', authenticateUser, getCart);
router.post('/', authenticateUser, addToCart);
router.delete('/:itemId', authenticateUser, removeFromCart);
router.put('/:itemId', authenticateUser, updateCartQuantity);

module.exports = router;
