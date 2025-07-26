"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const environment_1 = require("./config/environment");
const database_1 = require("./config/database");
const logger_1 = require("./utils/logger");
// Import routes
const auth_1 = __importDefault(require("./routes/auth"));
const chat_1 = __importDefault(require("./routes/chat"));
const tasks_1 = __importDefault(require("./routes/tasks"));
const memory_1 = __importDefault(require("./routes/memory"));
const files_1 = __importDefault(require("./routes/files"));
const design_1 = __importDefault(require("./routes/design"));
const health_1 = __importDefault(require("./routes/health"));
// Create Express app
const app = (0, express_1.default)();
// Security middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false // Allow for development
}));
// CORS configuration
app.use((0, cors_1.default)({
    origin: environment_1.config.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Compression
app.use((0, compression_1.default)());
// Request logging
app.use((0, morgan_1.default)('combined', {
    stream: {
        write: (message) => logger_1.logger.info(message.trim())
    }
}));
// Body parsing
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: environment_1.config.rateLimit.windowMs,
    max: environment_1.config.rateLimit.maxRequests,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
// API Routes
app.use('/api/auth', auth_1.default);
app.use('/api/chat', chat_1.default);
app.use('/api/tasks', tasks_1.default);
app.use('/api/memory', memory_1.default);
app.use('/api/files', files_1.default);
app.use('/api/design', design_1.default);
app.use('/api/health', health_1.default);
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
app.use((error, req, res, next) => {
    logger_1.logger.error('Unhandled error', { error, url: req.url, method: req.method });
    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Internal server error',
        ...(environment_1.config.nodeEnv === 'development' && { stack: error.stack })
    });
});
// Server startup
async function startServer() {
    try {
        // Connect to databases
        await (0, database_1.connectMongoDB)();
        await (0, database_1.connectRedis)();
        // Start server
        const server = app.listen(environment_1.config.port, () => {
            logger_1.logger.info(`Tela AI Backend server running on port ${environment_1.config.port}`, {
                environment: environment_1.config.nodeEnv,
                port: environment_1.config.port
            });
        });
        // Graceful shutdown
        process.on('SIGTERM', () => {
            logger_1.logger.info('SIGTERM received, shutting down gracefully');
            server.close(() => {
                logger_1.logger.info('Process terminated');
                process.exit(0);
            });
        });
        process.on('SIGINT', () => {
            logger_1.logger.info('SIGINT received, shutting down gracefully');
            server.close(() => {
                logger_1.logger.info('Process terminated');
                process.exit(0);
            });
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to start server', { error });
        process.exit(1);
    }
}
// Start the server
startServer();
exports.default = app;
//# sourceMappingURL=server.js.map