const express = require('express');
const router = express.Router();

// GET /api/chat/test - Test endpoint
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Chat API is working'
  });
});

module.exports = router;