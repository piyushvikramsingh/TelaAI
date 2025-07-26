"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDatabaseHealth = exports.connectRedis = exports.redisClient = exports.connectMongoDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const redis_1 = require("redis");
const environment_1 = require("./environment");
const logger_1 = require("../utils/logger");
// MongoDB Connection
const connectMongoDB = async () => {
    try {
        const options = {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            bufferCommands: false,
            bufferMaxEntries: 0,
        };
        await mongoose_1.default.connect(environment_1.config.mongodb.uri, options);
        mongoose_1.default.connection.on('connected', () => {
            logger_1.logger.info('MongoDB connected successfully');
        });
        mongoose_1.default.connection.on('error', (err) => {
            logger_1.logger.error('MongoDB connection error:', err);
        });
        mongoose_1.default.connection.on('disconnected', () => {
            logger_1.logger.warn('MongoDB disconnected');
        });
        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose_1.default.connection.close();
            logger_1.logger.info('MongoDB connection closed through app termination');
            process.exit(0);
        });
    }
    catch (error) {
        logger_1.logger.error('MongoDB connection failed:', error);
        process.exit(1);
    }
};
exports.connectMongoDB = connectMongoDB;
// Redis Connection
exports.redisClient = (0, redis_1.createClient)({
    url: environment_1.config.redis.url,
    socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500)
    }
});
const connectRedis = async () => {
    try {
        await exports.redisClient.connect();
        exports.redisClient.on('connect', () => {
            logger_1.logger.info('Redis connected successfully');
        });
        exports.redisClient.on('error', (err) => {
            logger_1.logger.error('Redis connection error:', err);
        });
        exports.redisClient.on('end', () => {
            logger_1.logger.warn('Redis connection ended');
        });
        // Graceful shutdown
        process.on('SIGINT', async () => {
            await exports.redisClient.quit();
            logger_1.logger.info('Redis connection closed through app termination');
        });
    }
    catch (error) {
        logger_1.logger.error('Redis connection failed:', error);
        // Don't exit process for Redis failures - app can work without cache
    }
};
exports.connectRedis = connectRedis;
// Database health check
const checkDatabaseHealth = async () => {
    const health = {
        mongodb: false,
        redis: false
    };
    try {
        // Check MongoDB
        if (mongoose_1.default.connection.readyState === 1) {
            await mongoose_1.default.connection.db?.admin().ping();
            health.mongodb = true;
        }
    }
    catch (error) {
        logger_1.logger.error('MongoDB health check failed:', error);
    }
    try {
        // Check Redis
        if (exports.redisClient.isOpen) {
            await exports.redisClient.ping();
            health.redis = true;
        }
    }
    catch (error) {
        logger_1.logger.error('Redis health check failed:', error);
    }
    return health;
};
exports.checkDatabaseHealth = checkDatabaseHealth;
//# sourceMappingURL=database.js.map