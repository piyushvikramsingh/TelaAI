import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';

let redisClient: RedisClientType;

export const connectRedis = async (): Promise<void> => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500)
      }
    });

    redisClient.on('error', (error) => {
      logger.error('❌ Redis client error:', error);
    });

    redisClient.on('connect', () => {
      logger.info('✅ Connected to Redis');
    });

    redisClient.on('reconnecting', () => {
      logger.info('🔄 Reconnecting to Redis...');
    });

    redisClient.on('ready', () => {
      logger.info('✅ Redis client ready');
    });

    await redisClient.connect();

  } catch (error) {
    logger.error('❌ Failed to connect to Redis:', error);
    // Don't exit process for Redis connection failure in development
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

export const getRedisClient = (): RedisClientType => {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
};

export const disconnectRedis = async (): Promise<void> => {
  try {
    if (redisClient) {
      await redisClient.quit();
      logger.info('Redis connection closed');
    }
  } catch (error) {
    logger.error('Error closing Redis connection:', error);
  }
};

// Cache helper functions
export const cacheGet = async (key: string): Promise<string | null> => {
  try {
    if (!redisClient?.isOpen) return null;
    return await redisClient.get(key);
  } catch (error) {
    logger.error('Cache get error:', error);
    return null;
  }
};

export const cacheSet = async (
  key: string,
  value: string,
  expireInSeconds?: number
): Promise<void> => {
  try {
    if (!redisClient?.isOpen) return;
    if (expireInSeconds) {
      await redisClient.setEx(key, expireInSeconds, value);
    } else {
      await redisClient.set(key, value);
    }
  } catch (error) {
    logger.error('Cache set error:', error);
  }
};

export const cacheDel = async (key: string): Promise<void> => {
  try {
    if (!redisClient?.isOpen) return;
    await redisClient.del(key);
  } catch (error) {
    logger.error('Cache delete error:', error);
  }
};