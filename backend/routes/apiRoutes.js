import express from 'express';
import { calculateSummary, calculateBudget } from '../controllers/calculateController.js';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'spendwise-local-api',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// App & capabilities info
router.get('/info', (req, res) => {
  res.status(200).json({
    name: 'SpendWise — Smart Personal Finance API',
    version: '1.0.0',
    mode: 'local-demo',
    description: 'Lightweight local calculations and utility backend',
    storageMode: 'client-localStorage-primary',
    capabilities: [
      'GET /api/health - Service health status',
      'GET /api/info - Application capabilities and runtime metadata',
      'POST /api/calculate/summary - Validated transaction summary and savings rate calculation',
      'POST /api/calculate/budget - Category spending and threshold status analysis'
    ]
  });
});

// Financial calculations
router.post('/calculate/summary', calculateSummary);
router.post('/calculate/budget', calculateBudget);

export default router;
