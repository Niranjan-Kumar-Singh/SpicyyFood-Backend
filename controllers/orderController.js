// controllers/orderController.js
const Order = require('../models/order');
const Cart = require('../models/cart');

// 📦 Create Order (Checkout)
exports.createOrder = async (req, res) => {
  try {
    const { orderType, tableNumber, pickupTime, paymentMethod } = req.body;

    if (!['dine-in', 'takeaway'].includes(orderType)) {
      return res.status(400).json({ message: 'Invalid order type' });
    }

    if (!paymentMethod || typeof paymentMethod !== 'string') {
      return res.status(400).json({ message: 'Payment method is required' });
    }

    if (orderType === 'dine-in' && !tableNumber) {
      return res.status(400).json({ message: 'Table number is required for dine-in orders' });
    }

    if (orderType === 'takeaway' && !pickupTime) {
      return res.status(400).json({ message: 'Pickup time is required for takeaway orders' });
    }

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
      paymentMethod, // Hardcoded for now
      status: 'pending',
      orderType,
      tableNumber: orderType === 'dine-in' ? tableNumber : undefined,
      pickupTime: orderType === 'takeaway' ? pickupTime : undefined,
    });

    await order.save();

    // Clear the cart after placing order
    cart.items = [];
    await cart.save();

    res.status(201).json({
      message: 'Order placed successfully',
      order,
    });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ message: 'Error placing order' });
  }
};

// 📄 Get Order History for Logged-in User
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 }) // Most recent first
      .populate('orderItems.product', 'name price') // Optional: for extra item info
      .lean(); // convert to plain JS objects for frontend

    if (!orders || orders.length === 0) {
      return res.status(200).json([]); // Just return empty array for consistency
    }

    // Optionally format response
    const formatted = orders.map(order => ({
      id: order._id,
      orderType: order.orderType,
      tableNumber: order.tableNumber || null,
      pickupTime: order.pickupTime || null,
      totalPrice: order.totalPrice,
      status: order.status,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
      orderItems: order.orderItems.map(item => ({
        productId: item.product?._id,
        name: item.name || item.product?.name,
        quantity: item.quantity,
        price: item.price,
      })),
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};

// ✅ Admin: Update Order Status
exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'shipped', 'completed', 'canceled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      message: `Invalid status. Valid statuses are: ${validStatuses.join(', ')}`,
    });
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
