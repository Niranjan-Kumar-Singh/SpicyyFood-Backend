// routes/orderRoutes.js
const express = require('express');
const {
  createOrder,
  updateOrderStatus,
  getUserOrders
} = require('../controllers/orderController');
const { authenticateUser, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Place a new order
router.post('/checkout', authenticateUser, createOrder);

// Get all orders for the logged-in user
router.get('/', authenticateUser, getUserOrders);

// Admin: Update order status
router.put('/:id/status', authenticateUser, isAdmin, updateOrderStatus);

module.exports = router;
