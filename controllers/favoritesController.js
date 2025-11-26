// Favorites Controller - Handle artwork and artist favorites

const User = require('../models/User');

// @desc    Toggle artwork favorite
// @route   POST /api/favorites/artwork/:artworkId
// @access  Private
const toggleArtworkFavorite = async (req, res) => {
  try {
    const { artworkId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if artwork is already in favoriteArtworks (ids only)
    const index = user.favoriteArtworks.indexOf(artworkId);

    if (index > -1) {
      // Remove from favoriteArtworks
      user.favoriteArtworks.splice(index, 1);
      await user.save();
      return res.json({ 
        message: 'Removed from favorites', 
        isFavorited: false,
        wishlist: user.favoriteArtworks 
      });
    } else {
      // Add to favoriteArtworks
      user.favoriteArtworks.push(artworkId);
      await user.save();
      return res.json({ 
        message: 'Added to favorites', 
        isFavorited: true,
        wishlist: user.favoriteArtworks 
      });
    }
  } catch (error) {
    console.error('Toggle artwork favorite error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Toggle artist favorite
// @route   POST /api/favorites/artist/:artistId
// @access  Private
const toggleArtistFavorite = async (req, res) => {
  try {
    const { artistId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if artist is already in favArtists
    const index = user.favArtists.indexOf(artistId);

    if (index > -1) {
      // Remove from favArtists
      user.favArtists.splice(index, 1);
      await user.save();
      return res.json({ 
        message: 'Unfollowed artist', 
        isFavorited: false,
        favArtists: user.favArtists 
      });
    } else {
      // Add to favArtists
      user.favArtists.push(artistId);
      await user.save();
      return res.json({ 
        message: 'Following artist', 
        isFavorited: true,
        favArtists: user.favArtists 
      });
    }
  } catch (error) {
    console.error('Toggle artist favorite error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all user favorites
// @route   GET /api/favorites
// @access  Private
const getAllFavorites = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select('favoriteArtworks favArtists');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      wishlist: user.favoriteArtworks || [],
      favArtists: user.favArtists || []
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Check if artwork is favorited
// @route   GET /api/favorites/artwork/:artworkId
// @access  Private
const checkArtworkFavorite = async (req, res) => {
  try {
    const { artworkId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId).select('favoriteArtworks');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFavorited = user.favoriteArtworks.includes(artworkId);

    res.json({ isFavorited });
  } catch (error) {
    console.error('Check artwork favorite error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Check if artist is favorited
// @route   GET /api/favorites/artist/:artistId
// @access  Private
const checkArtistFavorite = async (req, res) => {
  try {
    const { artistId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId).select('favArtists');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFavorited = user.favArtists.includes(artistId);

    res.json({ isFavorited });
  } catch (error) {
    console.error('Check artist favorite error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  toggleArtworkFavorite,
  toggleArtistFavorite,
  getAllFavorites,
  checkArtworkFavorite,
  checkArtistFavorite
};
