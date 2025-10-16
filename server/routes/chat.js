const express = require('express');
const axios = require('axios');
const router = express.Router();

// Import vector store for RAG
const vectorStore = require('../services/vectorStore');

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
    const { message, conversationHistory = [], model = DEFAULT_MODEL, useRAG = true } = req.body;

    // Validate input
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Message is required and must be a string'
      });
    }

    // RAG: Retrieve relevant context from vector store
    let systemPrompt = "You are a helpful AI assistant.";
    let retrievedDocs = [];
    
    if (useRAG) {
      try {
        // Search for relevant documents (top 3 most similar)
        const results = await vectorStore.searchSimilar(message, 3, 0.3); // 0.3 = minimum similarity threshold
        
        if (results.length > 0) {
          retrievedDocs = results;
          
          // Build context from retrieved documents
          const contextText = results
            .map((r, i) => `${i + 1}. ${r.document.text}`)
            .join('\n');
          
          systemPrompt = `You are a helpful AI assistant answering questions about Ahmed Babay.

RETRIEVED INFORMATION (use this to answer the user's question):
${contextText}

INSTRUCTIONS:
- Use the retrieved information above to answer the user's question accurately
- Be specific and cite facts from the context when relevant
- If the question cannot be fully answered with the context, use what's available and be honest about limitations
- Respond in a natural, conversational manner
- Do not mention that you're using "retrieved information" or "context" - just answer naturally`;

          console.log(`🧠 RAG: Retrieved ${results.length} relevant documents`);
          results.forEach((r, i) => {
            console.log(`   ${i + 1}. [${r.similarity.toFixed(3)}] ${r.document.text.substring(0, 60)}...`);
          });
        } else {
          console.log('🧠 RAG: No relevant documents found, using default prompt');
        }
      } catch (error) {
        console.error('⚠️  RAG search error:', error.message);
        // Continue without RAG if there's an error
      }
    }

    // Prepare conversation for API
    const messages = [];
    
    // Add system message with context (if RAG is enabled and context was found)
    messages.push({ role: 'system', content: systemPrompt });
    
    // Add conversation history
    if (conversationHistory && conversationHistory.length > 0) {
      messages.push(...conversationHistory);
    }
    
    // Add current user message
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
      model: model,
      rag: {
        used: useRAG && retrievedDocs.length > 0,
        documents_retrieved: retrievedDocs.length,
        sources: retrievedDocs.map(r => ({
          text: r.document.text.substring(0, 100) + '...',
          similarity: r.similarity.toFixed(3),
          category: r.document.metadata.category
        }))
      }
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