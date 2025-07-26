import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface CustomError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: string | number;
  path?: string;
  value?: string;
  errors?: any;
}

// Custom error class
export class AppError extends Error implements CustomError {
  statusCode: number;
  isOperational: boolean;
  code?: string | number;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Handle specific MongoDB errors
const handleMongooseError = (error: CustomError): AppError => {
  let message = 'Database operation failed';
  let statusCode = 500;

  // Handle validation errors
  if (error.name === 'ValidationError' && error.errors) {
    const errors = Object.values(error.errors).map((err: any) => err.message);
    message = `Validation failed: ${errors.join(', ')}`;
    statusCode = 400;
  }

  // Handle duplicate key errors
  if (error.code === 11000) {
    const field = Object.keys((error as any).keyValue)[0];
    message = `${field} already exists. Please use a different value.`;
    statusCode = 409;
  }

  // Handle cast errors
  if (error.name === 'CastError') {
    message = `Invalid ${error.path}: ${error.value}`;
    statusCode = 400;
  }

  return new AppError(message, statusCode);
};

// Handle JWT errors
const handleJWTError = (): AppError => {
  return new AppError('Invalid token. Please log in again.', 401);
};

const handleJWTExpiredError = (): AppError => {
  return new AppError('Your token has expired. Please log in again.', 401);
};

// Send error response in development
const sendErrorDev = (err: CustomError, res: Response): void => {
  res.status(err.statusCode || 500).json({
    status: 'error',
    error: err,
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
  });
};

// Send error response in production
const sendErrorProd = (err: CustomError, res: Response): void => {
  // Operational, trusted errors: send message to client
  if (err.isOperational) {
    res.status(err.statusCode || 500).json({
      status: 'error',
      message: err.message,
      timestamp: new Date().toISOString(),
    });
  } else {
    // Programming or other unknown errors: don't leak error details
    logger.error('UNKNOWN ERROR:', err);

    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
      timestamp: new Date().toISOString(),
    });
  }
};

// Main error handling middleware
export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error('Error Handler:', {
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id,
  });

  // Handle specific error types
  if (error.name === 'ValidationError' || error.name === 'CastError' || error.code === 11000) {
    error = handleMongooseError(error);
  }

  if (error.name === 'JsonWebTokenError') {
    error = handleJWTError();
  }

  if (error.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  }

  // Send appropriate error response
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

// Async error wrapper
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

// Handle unhandled routes
export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const err = new AppError(`Can't find ${req.originalUrl} on this server!`, 404);
  next(err);
};

// Rate limit error handler
export const rateLimitHandler = (req: Request, res: Response): void => {
  logger.warn('Rate limit exceeded', {
    ip: req.ip,
    path: req.path,
    method: req.method,
    userAgent: req.get('User-Agent'),
  });

  res.status(429).json({
    status: 'error',
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: 15 * 60 * 1000, // 15 minutes
    timestamp: new Date().toISOString(),
  });
};