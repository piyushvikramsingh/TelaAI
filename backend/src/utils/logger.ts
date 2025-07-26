import winston from 'winston';
import path from 'path';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which level to use based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define different log formats
const devFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

const prodFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    level: level(),
    format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
  }),
];

// Add file transports in production
if (process.env.NODE_ENV === 'production') {
  // Ensure logs directory exists
  const logDir = 'logs';
  
  transports.push(
    // Error log file
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: prodFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Combined log file
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      format: prodFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Create the logger
export const logger = winston.createLogger({
  level: level(),
  levels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports,
  exitOnError: false,
});

// Create a stream object for Morgan
export const morganStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Helper functions for specific log types
export const logError = (message: string, error?: any, meta?: any) => {
  logger.error(message, { error: error?.message || error, stack: error?.stack, ...meta });
};

export const logWarn = (message: string, meta?: any) => {
  logger.warn(message, meta);
};

export const logInfo = (message: string, meta?: any) => {
  logger.info(message, meta);
};

export const logDebug = (message: string, meta?: any) => {
  logger.debug(message, meta);
};

export const logHttp = (message: string, meta?: any) => {
  logger.http(message, meta);
};

// Log application startup
export const logStartup = (port: number | string, environment: string) => {
  logger.info('🚀 Tela AI Backend Started', {
    port,
    environment,
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
  });
};

// Log database connections
export const logDatabaseConnection = (database: string, status: 'connected' | 'disconnected' | 'error', details?: any) => {
  const level = status === 'error' ? 'error' : 'info';
  logger[level](`Database ${database} ${status}`, { database, status, ...details });
};

// Log API requests
export const logApiRequest = (method: string, url: string, userId?: string, duration?: number, statusCode?: number) => {
  logger.http('API Request', {
    method,
    url,
    userId,
    duration,
    statusCode,
    timestamp: new Date().toISOString(),
  });
};

// Log AI operations
export const logAiOperation = (operation: string, userId: string, model?: string, tokens?: number, cost?: number) => {
  logger.info('AI Operation', {
    operation,
    userId,
    model,
    tokens,
    cost,
    timestamp: new Date().toISOString(),
  });
};

// Log security events
export const logSecurityEvent = (event: string, userId?: string, ip?: string, details?: any) => {
  logger.warn('Security Event', {
    event,
    userId,
    ip,
    timestamp: new Date().toISOString(),
    ...details,
  });
};

export default logger;