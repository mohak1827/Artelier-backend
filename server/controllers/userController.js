const User = require('../models/User');

// ... (Keep addToCart, removeFromCart, addToWishlist, removeFromWishlist, addFavArtist, removeFavArtist SAME AS BEFORE) ...

exports.addToCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const isItemInCart = user.cart.some(item => item.artworkId === req.body.artworkId);
    if (!isItemInCart) {
      user.cart.push(req.body);
      await user.save();
    }
    res.status(200).json({ success: true, cart: user.cart });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.removeFromCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.cart = user.cart.filter(item => item.artworkId !== req.params.id);
    await user.save();
    res.status(200).json({ success: true, cart: user.cart });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.addToWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const isItemInWishlist = user.wishlist.some(item => item.artworkId === req.body.artworkId);
    if (!isItemInWishlist) {
      user.wishlist.push(req.body);
      await user.save();
    }
    res.status(200).json({ success: true, wishlist: user.wishlist });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.wishlist = user.wishlist.filter(item => item.artworkId !== req.params.id);
    await user.save();
    res.status(200).json({ success: true, wishlist: user.wishlist });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.addFavArtist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const isFav = user.favArtists.some(artist => artist.artistId === req.body.artistId);
    if (!isFav) {
      user.favArtists.push(req.body);
      await user.save();
    }
    res.status(200).json({ success: true, favArtists: user.favArtists });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.removeFavArtist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.favArtists = user.favArtists.filter(artist => artist.artistId !== req.params.id);
    await user.save();
    res.status(200).json({ success: true, favArtists: user.favArtists });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// --- CRITICAL UPDATE HERE ---
exports.createOrder = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    const newOrder = {
      id: Date.now().toString(),
      date: new Date(),
      total: req.body.total,
      items: req.body.items,
      // 1. MUST SAVE TRANSACTION ID
      transactionId: req.body.transactionId, 
      // 2. MUST SET STATUS TO 'Pending Verification'
      status: 'Pending Verification', 
      userId: user._id 
    };

    user.orders.unshift(newOrder);
    
    if (req.body.clearCart) {
      user.cart = [];
    }

    await user.save();
    res.status(200).json({ success: true, orders: user.orders, cart: user.cart });
  } catch (error) { res.status(500).json({ message: error.message }); }
};