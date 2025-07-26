import mongoose from 'mongoose';
import { createClient } from 'redis';
import { config } from './environment';
import { logger } from '../utils/logger';

// MongoDB Connection
export const connectMongoDB = async (): Promise<void> => {
  try {
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      bufferMaxEntries: 0,
    };

    await mongoose.connect(config.mongodb.uri, options);
    
    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connected successfully');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Redis Connection
export const redisClient = createClient({
  url: config.redis.url,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 500)
  }
});

export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
    
    redisClient.on('connect', () => {
      logger.info('Redis connected successfully');
    });

    redisClient.on('error', (err) => {
      logger.error('Redis connection error:', err);
    });

    redisClient.on('end', () => {
      logger.warn('Redis connection ended');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await redisClient.quit();
      logger.info('Redis connection closed through app termination');
    });

  } catch (error) {
    logger.error('Redis connection failed:', error);
    // Don't exit process for Redis failures - app can work without cache
  }
};

// Database health check
export const checkDatabaseHealth = async (): Promise<{ mongodb: boolean; redis: boolean }> => {
  const health = {
    mongodb: false,
    redis: false
  };

  try {
    // Check MongoDB
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db?.admin().ping();
      health.mongodb = true;
    }
  } catch (error) {
    logger.error('MongoDB health check failed:', error);
  }

  try {
    // Check Redis
    if (redisClient.isOpen) {
      await redisClient.ping();
      health.redis = true;
    }
  } catch (error) {
    logger.error('Redis health check failed:', error);
  }

  return health;
};