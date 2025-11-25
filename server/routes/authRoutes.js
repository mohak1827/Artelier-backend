const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  loginAdmin, // <-- This is the function for admin-only login
  logoutUser, 
  getMe, 
  updateProfile,
  setPassword,
  googleAuth,
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

// Public Routes
router.post('/signup', registerUser);

// Google OAuth (Firebase) Login / Signup
router.post('/google', googleAuth);

// General User Login: Handles authentication for users with the 'user' role
router.post('/login', loginUser);

// Dedicated Admin Login: Handles authentication ONLY for users with the 'admin' role
router.post('/admin/login', loginAdmin);

// Protected Routes (require a valid token)
router.get('/logout', logoutUser);
router.get('/me', protect, getMe);
router.put('/updateProfile', protect, updateProfile);
router.post('/setPassword', protect, setPassword);

module.exports = router;