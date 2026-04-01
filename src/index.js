require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Import database configuration
const { connectDB } = require('./config/database');

// Import routes
const categoryRoutes = require('./routes/categoryRoutes');
const blogRoutes = require('./routes/blogRoutes');
const eventRoutes = require('./routes/eventRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const contactRoutes = require('./routes/contactRoutes');
const articleRoutes = require('./routes/articleRoutes');
const videoRoutes = require('./routes/videoRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');

// Import models to initialize them
require('./models/Category');
require('./models/Blog');
require('./models/Event');
require('./models/Contact');
require('./models/Video');
require('./models/Newsletter');

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet()); // Security headers

// CORS Configuration - Allow multiple origins
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:3000'];

const normalizeOrigin = (origin) => {
  if (origin === "*") return "*";
  return origin?.trim();
};

const baseAllowedOrigins = [
  ...corsOrigins,
  'https://welltalk.vercel.app',  // Your hosted frontend
  'https://welltalk.netlify.app', // Alternative hosting
  "*",       // Wildcard - allow all origins
  'http://127.0.0.1:3000',       // Localhost alternative
].map((origin) => normalizeOrigin(origin)).filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // If wildcard is in allowed origins, allow all
    if (baseAllowedOrigins.includes("*")) {
      return callback(null, true);
    }
    
    if (baseAllowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use(morgan('combined')); // Logging
app.use(express.json({ limit: '50mb' })); // Parse JSON requests with increased limit
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Parse URL-encoded data with increased limit

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/blogs', blogRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/contact-forms', contactRoutes);
app.use('/api/v1/articles', articleRoutes);
app.use('/api/v1/videos', videoRoutes);
app.use('/api/v1/newsletter', newsletterRoutes);

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Welcome Route
app.get('/api/v1', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Welltalk Backend API',
    version: '1.0.0',
    endpoints: {
      blogs: '/api/v1/blogs',
      categories: '/api/v1/categories',
      events: '/api/v1/events',
      uploads: '/api/v1/upload',
      'contact-forms': '/api/v1/contact-forms',
      articles: '/api/v1/articles',
      videos: '/api/v1/videos',
      newsletter: '/api/v1/newsletter',
    },
    status: 'active',
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start Server and Connect Database
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 API Base URL: http://localhost:${PORT}/api/v1`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
