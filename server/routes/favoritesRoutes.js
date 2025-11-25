// Favorites Routes

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  toggleArtworkFavorite,
  toggleArtistFavorite,
  getAllFavorites,
  checkArtworkFavorite,
  checkArtistFavorite
} = require('../controllers/favoritesController');

// Get all favorites
router.get('/', protect, getAllFavorites);

// Toggle artwork favorite
router.post('/artwork/:artworkId', protect, toggleArtworkFavorite);

// Toggle artist favorite
router.post('/artist/:artistId', protect, toggleArtistFavorite);

// Check if artwork is favorited
router.get('/artwork/:artworkId', protect, checkArtworkFavorite);

// Check if artist is favorited
router.get('/artist/:artistId', protect, checkArtistFavorite);

module.exports = router;
