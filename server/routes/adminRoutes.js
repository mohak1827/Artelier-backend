const express = require('express');
const router = express.Router();
const { getAllOrders, updateOrderStatus } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

/**
 * Middleware to check if the authenticated user has the 'isAdmin: true' flag.
 * This flag is assumed to be included in the JWT payload by loginAdmin.
 */
const admin = (req, res, next) => {
  // Check if the user object exists AND the isAdmin field is explicitly true
  if (req.user && req.user.isAdmin === true) { 
    next();
  } else {
    // 403 Forbidden is used when the user is authenticated but lacks the necessary authorization
    res.status(403).json({ 
      message: 'Access Denied: Not authorized as an administrator.' 
    });
  }
};

// @route GET /api/admin/orders
// @desc Get all user orders
// @access Private (Admin Only)
router.get('/orders', protect, admin, getAllOrders);

// @route PUT /api/admin/order/status
// @desc Update the status of a specific order
// @access Private (Admin Only)
router.put('/order/status', protect, admin, updateOrderStatus);

module.exports = router;