const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Load vector store for RAG
const vectorStore = require('./services/vectorStore');

const app = express();
const PORT = process.env.PORT || 5000;

// Security and middleware setup
app.use(helmet()); // Security headers
app.use(morgan('combined')); // Logging

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration for frontend
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Import and use chat routes
const chatRoutes = require('./routes/chat');
app.use('/api/chat', chatRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API base: http://localhost:${PORT}/api`);
  
  // Load vector store for RAG
  try {
    await vectorStore.load();
    console.log(`🧠 RAG system ready with ${vectorStore.getStats().total_documents} documents`);
  } catch (error) {
    console.error('⚠️  Warning: Could not load vector store:', error.message);
    console.error('   RAG features will not be available');
  }
});

module.exports = app;