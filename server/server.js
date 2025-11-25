const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS Configuration
// Allow common Vite dev ports and optionally override via FRONTEND_URL env
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5174',
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow non-browser tools (no origin) and allowed frontends
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Essential for passing cookies (session)
}));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes')); // Admin Dashboard routes
app.use('/api/favorites', require('./routes/favoritesRoutes')); // Favorites routes

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));