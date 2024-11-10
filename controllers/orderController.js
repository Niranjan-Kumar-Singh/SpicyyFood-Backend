// controllers/orderController.js
const Order = require('../models/order');
const Cart = require('../models/cart');

// Create Order
exports.createOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.item');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty' });
    }

    const orderItems = cart.items.map(item => ({
      product: item.item._id,
      quantity: item.quantity,
      price: item.item.price,
      name: item.item.name,
    }));

    const totalPrice = cart.items.reduce((total, item) => total + item.quantity * item.item.price, 0);

    const order = new Order({
      user: req.user._id,
      orderItems,
      totalPrice,
      paymentMethod: 'Credit Card', // Hardcoded value for payment method
      status: 'pending',
    });

    await order.save();

    // Clear the cart after the order is placed
    cart.items = [];
    await cart.save();

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ message: 'Error placing order' });
  }
};

// Get Orders for the authenticated user
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('orderItems.product', 'name price') // Populate product details
      .populate('user', 'name email'); // Optionally populate user details if needed

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Update Order Status
exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'shipped', 'completed', 'canceled'];

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
};
