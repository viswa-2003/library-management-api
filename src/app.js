const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { errorHandler } = require('./utils/error.util');
const { sequelize } = require('./models');

// Import routes
const bookRoutes = require('./routes/book.routes');
const memberRoutes = require('./routes/member.routes');
const transactionRoutes = require('./routes/transaction.routes');
const fineRoutes = require('./routes/fine.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: 'Checking...'
  });
});
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
});
// API Routes with proper prefixes
app.use('/api', bookRoutes);
app.use('/api', memberRoutes);
app.use('/api', transactionRoutes);
app.use('/api', fineRoutes);

// 404 handler - FIX: Use a proper catch-all route
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.url} not found`
  });
});

// Error handler
app.use(errorHandler);

// Sync database
const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync all models
    await sequelize.sync({ alter: true });
    console.log('Database synchronized');
  } catch (error) {
    console.error('Database error:', error);
  }
};

// Initialize database
syncDatabase();

module.exports = app;