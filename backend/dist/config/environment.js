"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTest = exports.isProduction = exports.isDevelopment = exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables
dotenv_1.default.config();
// Validate required environment variables
const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'OPENAI_API_KEY'
];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
    console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    console.error('Please create a .env file based on .env.example');
    process.exit(1);
}
exports.config = {
    // Server
    port: parseInt(process.env.PORT || '8000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    // Database
    mongodb: {
        uri: process.env.MONGODB_URI,
    },
    redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
    },
    // Authentication
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
    bcrypt: {
        rounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    },
    // OpenAI
    openai: {
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '4000', 10),
    },
    // Firebase (Optional)
    firebase: {
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        clientId: process.env.FIREBASE_CLIENT_ID,
        authUri: process.env.FIREBASE_AUTH_URI,
        tokenUri: process.env.FIREBASE_TOKEN_URI,
    },
    // File Upload
    upload: {
        maxSize: parseInt(process.env.UPLOAD_MAX_SIZE || '10485760', 10), // 10MB
        allowedTypes: process.env.UPLOAD_ALLOWED_TYPES?.split(',') || [
            'image/jpeg',
            'image/png',
            'image/gif',
            'text/plain',
            'application/pdf',
            'application/json'
        ],
        destination: path_1.default.join(process.cwd(), 'uploads'),
    },
    // Rate Limiting
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
        aiMaxRequests: parseInt(process.env.AI_RATE_LIMIT_MAX_REQUESTS || '30', 10),
    },
    // Logging
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        file: process.env.LOG_FILE || 'logs/tela-ai.log',
    },
    // Plan Limits
    planLimits: {
        free: {
            monthlyCredits: 1000,
            maxConversations: 10,
            maxFiles: 50,
            maxMemoryEntries: 100,
            maxTasksPerMonth: 50,
            prioritySupport: false,
            advancedFeatures: false,
        },
        pro: {
            monthlyCredits: 10000,
            maxConversations: 100,
            maxFiles: 500,
            maxMemoryEntries: 1000,
            maxTasksPerMonth: 500,
            prioritySupport: true,
            advancedFeatures: true,
        },
        enterprise: {
            monthlyCredits: 100000,
            maxConversations: -1, // unlimited
            maxFiles: -1, // unlimited
            maxMemoryEntries: -1, // unlimited
            maxTasksPerMonth: -1, // unlimited
            prioritySupport: true,
            advancedFeatures: true,
        },
    },
};
// Helper functions
const isDevelopment = () => exports.config.nodeEnv === 'development';
exports.isDevelopment = isDevelopment;
const isProduction = () => exports.config.nodeEnv === 'production';
exports.isProduction = isProduction;
const isTest = () => exports.config.nodeEnv === 'test';
exports.isTest = isTest;
//# sourceMappingURL=environment.js.map