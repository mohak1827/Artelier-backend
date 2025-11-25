const User = require('../models/User'); // Import the User model
const jwt = require('jsonwebtoken');      // For creating JSON Web Tokens
const bcrypt = require('bcryptjs');     // For password comparison

// IMPORTANT: This secret MUST be securely managed in a real application 
// (e.g., loaded from process.env.JWT_SECRET)
const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key'; 

/**
 * Helper function to generate a JWT token.
 * @param {string} id - The MongoDB user ID.
 * @param {boolean} isAdmin - Flag indicating admin status.
 * @returns {string} The signed JWT token.
 */
const generateToken = (id, isAdmin) => {
    // Include the isAdmin flag in the token payload.
    return jwt.sign({ id, isAdmin }, JWT_SECRET, {
        expiresIn: '30d', // Token expires in 30 days
    });
};

// --------------------------------------------------------
// Dedicated Admin Login Function
// --------------------------------------------------------
exports.loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    // Input validation (optional, but good practice)
    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide both email and password.' });
    }

    try {
        // 1. Find user by email
        const user = await User.findOne({ email });

        // 2. Check if the user exists, the provided password matches the stored hash, 
        //    AND the user document has isAdmin set to true.
        if (
            user && 
            (await bcrypt.compare(password, user.password)) && 
            user.isAdmin === true
        ) {
            
            // Successful Admin Login
            res.status(200).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                isAdmin: true, 
                // Generate token with isAdmin: true flag
                token: generateToken(user._id, true), 
                // Message to guide client-side redirection
                message: 'Admin login successful. Redirect to dashboard.', 
            });
        } else {
            // Failed login: User not found, wrong password, or user is not an admin.
            res.status(401).json({ 
                message: 'Invalid credentials or not authorized as an Admin.' 
            });
        }
    } catch (error) {
        console.error('Admin Login Error:', error);
        res.status(500).json({ message: 'Server error during admin login.' });
    }
};

// --------------------------------------------------------
// Placeholder Exported Functions (Assumed to be required)
// --------------------------------------------------------

// Placeholder for standard user login (adjust as needed if you have one)
exports.loginUser = async (req, res) => {
    // ... standard user login logic (checks password, generates token)
    res.status(501).json({ message: 'User login not fully implemented in this snippet.' });
};

// Placeholder for user registration (adjust as needed if you have one)
exports.registerUser = async (req, res) => {
    // ... registration logic
    res.status(501).json({ message: 'User registration not fully implemented in this snippet.' });
};

// --------------------------------------------------------
// Admin Order Management Handlers
// --------------------------------------------------------

// @desc    Get all orders from all users (flattened list)
// @route   GET /api/admin/orders
// @access  Private/Admin (protect + admin middleware applied in routes)
exports.getAllOrders = async (req, res) => {
  try {
    // Fetch only fields needed to build an aggregated orders list
    const users = await User.find({}, 'name email orders').lean();

    const orders = [];

    users.forEach(user => {
      (user.orders || []).forEach(order => {
        orders.push({
          // Order-level fields
          id: order.id,
          date: order.date,
          total: order.total,
          items: order.items,
          status: order.status,
          transactionId: order.transactionId,
          userId: order.userId || String(user._id),

          // Convenience fields for the admin dashboard UI
          customerName: user.name,
          customerEmail: user.email,
        });
      });
    });

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching all orders for admin:', error);
    return res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

// @desc    Update status of a specific order for a specific user
// @route   PUT /api/admin/order/status
// @access  Private/Admin (protect + admin middleware applied in routes)
// @body    { userId, orderId, status }
exports.updateOrderStatus = async (req, res) => {
  const { userId, orderId, status } = req.body;

  if (!userId || !orderId || !status) {
    return res.status(400).json({ message: 'userId, orderId and status are required' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const order = (user.orders || []).find(o => o.id === orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await user.save();

    return res.status(200).json({ success: true, message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Error updating order status for admin:', error);
    return res.status(500).json({ message: 'Failed to update order status' });
  }
};