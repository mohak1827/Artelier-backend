const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  addToCart, removeFromCart,
  addToWishlist, removeFromWishlist,
  addFavArtist, removeFavArtist,
  createOrder
} = require('../controllers/userController');

// Cart
router.post('/cart/add', protect, addToCart);
router.delete('/cart/remove/:id', protect, removeFromCart);

// Wishlist
router.post('/wishlist/add', protect, addToWishlist);
router.delete('/wishlist/remove/:id', protect, removeFromWishlist);

// Fav Artists
router.post('/favArtists/add', protect, addFavArtist);
router.delete('/favArtists/remove/:id', protect, removeFavArtist);

// Orders
router.post('/orders/create', protect, createOrder);

module.exports = router;