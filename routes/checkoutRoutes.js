const express = require('express');
const { authenticateUser } = require('../middleware/authMiddleware');
const Order = require('../models/order'); // Ensure this is the correct path to your order model
const Cart = require('../models/cart'); // Import the Cart model
const router = express.Router();

// Place Order
router.post('/', authenticateUser, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.item');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty or invalid" });
    }

    // Create order items from cart items
    const orderItems = cart.items.map(item => ({
      product: item.item._id,
      quantity: item.quantity,
      price: item.item.price,
      name: item.item.name,
    }));

    // Calculate total price
    const totalPrice = orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const roundedTotalPrice = parseFloat(totalPrice).toFixed(2);

    // Create new order
    const order = new Order({
      orderItems,
      totalPrice: roundedTotalPrice,
      user: req.user._id,
      status: 'pending', // Enum-like status
    });

    // Save order to the database
    const savedOrder = await order.save();

    // Clear the cart after placing the order
    cart.items = [];
    await cart.save();

    res.status(201).json({
      message: 'Order placed successfully',
      order: savedOrder,
    });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Get Orders for the authenticated user
router.get('/', authenticateUser, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('orderItems.product', 'name price') // Populate product details
      .populate('user', 'name email'); // Optionally populate user details if needed

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error); // Log error for debugging
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Update Order Status
router.put('/:id/status', authenticateUser, async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'shipped', 'completed', 'canceled']; // Status constants

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: `Invalid status. Valid statuses are: ${validStatuses.join(', ')}` });
  }

  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();
    res.status(200).json({
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = router;
