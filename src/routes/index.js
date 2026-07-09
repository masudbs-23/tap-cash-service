const express = require('express');
const authRoutes = require('./authRoutes');
const walletRoutes = require('./walletRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/wallet', walletRoutes);

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    },
  });
});

module.exports = router;
