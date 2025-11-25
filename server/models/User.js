const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImage: { type: String, default: '' },
  about: { type: String, default: 'Art enthusiast and collector.' },
  
  // Admin Flag - Set to true manually in DB for admin users
  isAdmin: { type: Boolean, default: false },

  cart: [{
    artworkId: String,
    title: String,
    price: String, 
    image: String,
    artistName: String
  }],
  // Detailed wishlist used by the Wishlist page
  wishlist: [{
    artworkId: String,
    title: String,
    price: String,
    image: String,
    artistName: String
  }],
  // Simple favorite artworks list used by FavoritesContext (ids only)
  favoriteArtworks: {
    type: [String],
    default: []
  },
  // Store favorite artists as simple string ids (e.g. '1', '2')
  favArtists: [String],
  
  // --- UPDATED ORDERS SCHEMA ---
  orders: [{
    id: String,
    date: Date,
    total: String,
    items: Array,
    status: { type: String, default: 'Pending Verification' }, // Changed Default
    transactionId: { type: String }, // Stores the UPI Transaction ID
    userId: { type: String } // Helpful for admin to know who ordered
  }]
}, { timestamps: true });

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);