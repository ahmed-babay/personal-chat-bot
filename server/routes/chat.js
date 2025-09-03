const express = require('express');
const axios = require('axios');
const router = express.Router();

// Hugging Face configuration
const HF_API_URL = process.env.HF_API_URL || 'https://router.huggingface.co/v1/chat/completions';
const DEFAULT_MODEL = process.env.HF_MODEL || 'deepseek-ai/DeepSeek-V3-0324:fireworks-ai';
const HF_API_TOKEN = process.env.HF_TOKEN;

// Validate Hugging Face configuration
const validateConfig = (req, res, next) => {
  if (!HF_API_TOKEN) {
    return res.status(500).json({
      error: 'Hugging Face API not configured',
      message: 'Please set HF_TOKEN in your environment variables'
    });
  }
  next();
};

// POST /api/chat - Send message to AI and get response
router.post('/', validateConfig, async (req, res) => {
  try {
    const { message, conversationHistory = [], model = DEFAULT_MODEL } = req.body;

    // Validate input
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Message is required and must be a string'
      });
    }

    // Prepare conversation for API
    const messages = [];
    if (conversationHistory && conversationHistory.length > 0) {
      messages.push(...conversationHistory);
    }
    messages.push({ role: 'user', content: message });

    // API request payload
    const payload = {
      messages: messages,
      model: model,
      stream: false,
      max_tokens: parseInt(process.env.MAX_TOKENS) || 500,
      temperature: parseFloat(process.env.TEMPERATURE) || 0.7
    };

    // Make request to Hugging Face
    const response = await axios.post(HF_API_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HF_API_TOKEN}`
      }
    });

    // Extract AI response
    let aiResponse = '';
    if (response.data?.choices?.[0]?.message?.content) {
      aiResponse = response.data.choices[0].message.content;
    }

    res.json({
      success: true,
      response: aiResponse,
      model: model
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    
    if (error.response?.status === 401) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid Hugging Face token'
      });
    }
    
    res.status(500).json({
      error: 'Failed to get AI response',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/chat/models - Get available AI models
router.get('/models', (req, res) => {
  const availableModels = [
    {
      id: 'deepseek-ai/DeepSeek-V3-0324:fireworks-ai',
      name: 'DeepSeek V3 (Fireworks AI)',
      description: 'High-performance language model optimized for chat',
      requires_token: true
    },
    {
      id: 'meta-llama/Llama-3.1-8B-Instruct:fireworks-ai',
      name: 'Llama 3.1 8B Instruct',
      description: 'Faster, smaller Llama model good for quick responses',
      requires_token: true
    },
    {
      id: 'meta-llama/Llama-3.1-70B-Instruct:fireworks-ai',
      name: 'Llama 3.1 70B Instruct',
      description: 'Large high-performance instruction model',
      requires_token: true
    },
  ];

  res.json({
    success: true,
    models: availableModels
  });
});

// GET /api/chat/test - Test endpoint (keep existing)
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Chat API is working'
  });
});

module.exports = router;