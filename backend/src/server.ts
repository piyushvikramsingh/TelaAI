import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from './config/environment';
import { connectMongoDB, connectRedis } from './config/database';
import { logger } from './utils/logger';

// Import routes
import authRoutes from './routes/auth';
import chatRoutes from './routes/chat';
import taskRoutes from './routes/tasks';
import memoryRoutes from './routes/memory';
import fileRoutes from './routes/files';
import designRoutes from './routes/design';
import healthRoutes from './routes/health';

// Create Express app
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false // Allow for development
}));

// CORS configuration
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compression
app.use(compression());

// Request logging
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim())
  }
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/memory', memoryRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/design', designRoutes);
app.use('/api/health', healthRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Tela AI Backend - Neural Interface Server',
    version: '1.0.0',
    status: 'operational',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', { error, url: req.url, method: req.method });
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(config.nodeEnv === 'development' && { stack: error.stack })
  });
});

// Server startup
async function startServer() {
  try {
    // Connect to databases
    await connectMongoDB();
    await connectRedis();

    // Start server
    const server = app.listen(config.port, () => {
      logger.info(`Tela AI Backend server running on port ${config.port}`, {
        environment: config.nodeEnv,
        port: config.port
      });
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully');
      server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

// Start the server
startServer();

export default app;