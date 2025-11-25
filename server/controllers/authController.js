const User = require('../models/User');
const jwt = require('jsonwebtoken');
const admin = require('../firebaseAdmin');

// Helper function to generate JWT token with isAdmin flag
const generateToken = (id, isAdmin = false) => {
  return jwt.sign({ id, isAdmin }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Helper function to send token via cookie and user data in JSON response
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id, user.isAdmin || false);

  // Cookie options
  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true, // Prevents access via client-side JavaScript (security)
    // secure: process.env.NODE_ENV === 'production', // Uncomment this in Production (requires HTTPS)
  };

  res.status(statusCode)
    .cookie('token', token, options) 
    .json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        about: user.about,
        cart: user.cart,
        wishlist: user.wishlist,
        favArtists: user.favArtists,
        isAdmin: user.isAdmin || false // Include isAdmin for client-side routing logic
      }
    });
};

// @route POST /api/auth/signup
// @desc Register a new user (defaults to 'user' role)
// @access Public
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Assuming User model defaults role to 'user'
    const user = await User.create({ name, email, password }); 
    sendTokenResponse(user, 201, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/auth/login
// @desc Auth a standard user (allows any non-admin login)
// @access Public
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // OPTIONAL: Deny access to admins here if you want the main login to *only* accept regular users
    if (user.isAdmin === true) {
      return res.status(403).json({ message: 'Admin users must use the administrator portal login.' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/auth/admin/login
// @desc Auth an admin user ONLY
// @access Public
exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // CRITICAL: Check the user's isAdmin status after successful authentication
    if (user.isAdmin !== true) {
      return res.status(403).json({ 
        message: 'Access denied. You do not have administrator privileges.' 
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/auth/logout
// @desc Log user out / Clear cookie
// @access Public/Private
exports.logoutUser = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ success: true, data: {} });
};

// @route GET /api/auth/me
// @desc Get current logged in user details
// @access Private
exports.getMe = async (req, res) => {
  try {
    // req.user is set by authMiddleware
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @route POST /api/auth/setPassword
// @desc Set or change password for the currently authenticated user
// @access Private
exports.setPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = password;
    await user.save();

    // Reuse helper to refresh JWT cookie and return updated user data
    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @route PUT /api/auth/updateProfile
// @desc Update user profile details
// @access Private
exports.updateProfile = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      about: req.body.about,
      profileImage: req.body.profileImage
    };
    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    }).select('-password');
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @route POST /api/auth/google
// @desc Login or register user using Firebase Google ID token
// @access Public
exports.googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'Missing idToken' });
    }

    // Verify the token with Firebase Admin
    const decoded = await admin.auth().verifyIdToken(idToken);
    const { email, name, picture, uid } = decoded;

    if (!email) {
      return res.status(400).json({ message: 'No email found in Google account' });
    }

    // Find or create the user in MongoDB
    let user = await User.findOne({ email });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = await User.create({
        name: name || 'Google User',
        email,
        profileImage: picture || '',
        isAdmin: false,
        // Set a generated dummy password so Mongoose validation passes;
        // this will be hashed by the pre-save hook.
        password: `google_${uid || Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      });
    }

    // Mirror sendTokenResponse logic here so we can also include isNewUser
    const token = generateToken(user._id, user.isAdmin || false);

    const options = {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
    };

    res
      .status(200)
      .cookie('token', token, options)
      .json({
        success: true,
        isNewUser,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          profileImage: user.profileImage,
          about: user.about,
          cart: user.cart,
          wishlist: user.wishlist,
          favArtists: user.favArtists,
          isAdmin: user.isAdmin || false,
        },
      });
  } catch (error) {
    console.error('Google authentication error:', error);
    res.status(401).json({ message: 'Google authentication failed' });
  }
};