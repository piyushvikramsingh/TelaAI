import { Router, Request, Response } from 'express';
import { checkDatabaseHealth } from '../config/database';
import { ApiResponse } from '../types';

const router = Router();

// Basic health check
router.get('/', (req: Request, res: Response<ApiResponse>) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0'
    },
    message: 'Service is healthy'
  });
});

// Detailed health check with database status
router.get('/detailed', async (req: Request, res: Response<ApiResponse>) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    const memoryUsage = process.memoryUsage();
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
      database: dbHealth,
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`
      },
      environment: process.env.NODE_ENV || 'development'
    };

    // Check if any critical services are down
    const isHealthy = dbHealth.mongodb; // Redis is optional
    const status = isHealthy ? 200 : 503;

    res.status(status).json({
      success: isHealthy,
      data: health,
      message: isHealthy ? 'All services healthy' : 'Some services are down'
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Health check failed',
      data: {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
});

export default router;