const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const createAdmin = async () => {
  try {
    // Delete existing admin if exists (to avoid duplicates)
    await User.deleteOne({ email: 'admin@artelier.com' });

    // IMPORTANT: Do NOT hash here. The User model's pre-save hook will hash once.
    await User.create({
      name: 'Super Admin',
      email: 'admin@artelier.com',
      password: 'Admin@1827', // Plain password; will be hashed by pre-save hook
      isAdmin: true,
      cart: [],
      wishlist: [],
      favArtists: [],
      orders: []
    });

    console.log('✅ Admin User Created Successfully!');
    process.exit();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

createAdmin();