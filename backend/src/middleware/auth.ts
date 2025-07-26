import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { AppError } from './errorHandler';
import { logger } from '../utils/logger';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

interface JWTPayload {
  userId: string;
  iat: number;
  exp: number;
}

// Verify JWT token
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (!token) {
      return next(new AppError('Access token is required', 401));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('+password');
    
    if (!user) {
      return next(new AppError('User no longer exists', 401));
    }

    // Check if user is verified
    if (!user.isVerified) {
      return next(new AppError('Please verify your email before accessing this resource', 401));
    }

    // Update last active
    user.lastActive = new Date();
    await user.save({ validateBeforeSave: false });

    // Attach user to request
    req.user = user;
    next();
  } catch (error: any) {
    logger.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid access token', 401));
    }
    
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Access token has expired', 401));
    }
    
    return next(new AppError('Authentication failed', 401));
  }
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
      const user = await User.findById(decoded.userId);
      
      if (user && user.isVerified) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Check if user has specific role
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
};

// Check subscription status
export const requireSubscription = (minPlan: 'free' | 'pro' | 'enterprise' = 'pro') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const planLevels = { free: 0, pro: 1, enterprise: 2 };
    const userPlanLevel = planLevels[req.user.subscription.plan];
    const requiredPlanLevel = planLevels[minPlan];

    if (userPlanLevel < requiredPlanLevel) {
      return next(new AppError(`${minPlan} subscription required`, 403));
    }

    // Check if subscription is active
    if (!req.user.isSubscriptionActive) {
      return next(new AppError('Active subscription required', 402));
    }

    next();
  };
};

// Check usage limits
export const checkUsageLimit = (limitType: 'aiTokens' | 'files' | 'tasks') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const usage = req.user.usage;
    let isLimitExceeded = false;

    switch (limitType) {
      case 'aiTokens':
        isLimitExceeded = usage.aiTokensUsed >= usage.aiTokensLimit;
        break;
      case 'files':
        isLimitExceeded = usage.filesUploaded >= usage.filesLimit;
        break;
      case 'tasks':
        isLimitExceeded = usage.tasksCreated >= usage.tasksLimit;
        break;
    }

    if (isLimitExceeded) {
      return next(new AppError(`${limitType} usage limit exceeded. Please upgrade your plan.`, 429));
    }

    next();
  };
};

// Verify refresh token
export const verifyRefreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const refreshToken = req.headers['x-refresh-token'] as string;

    if (!refreshToken) {
      return next(new AppError('Refresh token is required', 401));
    }

    // Find user with this refresh token
    const user = await User.findOne({ refreshTokens: refreshToken });

    if (!user) {
      return next(new AppError('Invalid refresh token', 401));
    }

    req.user = user;
    (req as any).refreshToken = refreshToken;
    next();
  } catch (error) {
    logger.error('Refresh token verification error:', error);
    return next(new AppError('Invalid refresh token', 401));
  }
};

// Rate limiting for specific users
export const userRateLimit = (maxRequests: number, windowMs: number) => {
  const userRequests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next();
    }

    const userId = req.user._id.toString();
    const now = Date.now();
    const userLimit = userRequests.get(userId);

    if (!userLimit || now > userLimit.resetTime) {
      userRequests.set(userId, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (userLimit.count >= maxRequests) {
      return next(new AppError('User rate limit exceeded', 429));
    }

    userLimit.count++;
    next();
  };
};

// Middleware to check if user owns resource
export const checkResourceOwnership = (resourceModel: any, resourceIdParam: string = 'id') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return next(new AppError('Authentication required', 401));
      }

      const resourceId = req.params[resourceIdParam];
      const resource = await resourceModel.findById(resourceId);

      if (!resource) {
        return next(new AppError('Resource not found', 404));
      }

      // Check if user owns the resource or is admin
      if (resource.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new AppError('Access denied', 403));
      }

      // Attach resource to request for use in controller
      (req as any).resource = resource;
      next();
    } catch (error) {
      logger.error('Resource ownership check error:', error);
      return next(new AppError('Error checking resource ownership', 500));
    }
  };
};