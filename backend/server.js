/**
 * DiamondManager Backend - Claude API Proxy
 * Handles Claude API requests to avoid CORS issues
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3010;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://diamondmanager-production.up.railway.app',
    'https://diamondmanager-frontend.up.railway.app',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));

// Claude API Proxy Route
app.post('/api/ai/chat', async (req, res) => {
  try {
    console.log('🤖 Proxying request to Claude API...');
    
    const { messages, model = 'claude-3-5-sonnet-20241022', max_tokens = 1000, temperature = 0.7 } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    // Use the API key from environment
    const apiKey = process.env.CLAUDE_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'Claude API key not configured' });
    }
    
    const response = await axios.post('https://api.anthropic.com/v1/messages', {
      model,
      max_tokens,
      temperature,
      messages
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'anthropic-version': '2023-06-01'
      }
    });

    console.log('✅ Claude API response received');
    res.json(response.data);
    
  } catch (error) {
    console.error('❌ Claude API proxy error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      res.status(401).json({ error: 'Claude API authentication failed' });
    } else if (error.response?.status === 429) {
      res.status(429).json({ error: 'Claude API rate limit exceeded' });
    } else {
      res.status(500).json({ 
        error: 'Claude API request failed',
        details: error.response?.data || error.message
      });
    }
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'DiamondManager Backend',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 DiamondManager Backend running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;