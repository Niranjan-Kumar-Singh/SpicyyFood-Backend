// routes/orderRoutes.js
const express = require('express');
const { createOrder, updateOrderStatus, getUserOrders } = require('../controllers/orderController');
const { authenticateUser, isAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

// Route to place a new order
router.post('/checkout', authenticateUser, createOrder);

// Route to get all orders of the authenticated user
router.get('/', authenticateUser, getUserOrders);

// Route to update order status
router.put('/:id/status', authenticateUser, isAdmin, updateOrderStatus);

module.exports = router;
