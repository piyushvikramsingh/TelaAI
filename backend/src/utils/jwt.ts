import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { IUser } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';

export interface TokenPayload {
  userId: string;
  role: string;
  subscription: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

// Generate access token
export const generateAccessToken = (user: IUser): string => {
  const payload: TokenPayload = {
    userId: user._id.toString(),
    role: user.role,
    subscription: user.subscription.plan
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'tela-ai',
    audience: 'tela-ai-users'
  });
};

// Generate refresh token
export const generateRefreshToken = (): string => {
  return crypto.randomBytes(40).toString('hex');
};

// Generate token pair
export const generateTokenPair = (user: IUser): TokenPair => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();
  
  // Store refresh token in user document
  user.refreshTokens.push(refreshToken);
  
  return {
    accessToken,
    refreshToken,
    expiresIn: JWT_EXPIRES_IN
  };
};

// Verify access token
export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'tela-ai',
      audience: 'tela-ai-users'
    }) as TokenPayload;
  } catch (error: any) {
    throw new Error(`Invalid access token: ${error.message}`);
  }
};

// Extract token from authorization header
export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};

// Generate email verification token
export const generateEmailVerificationToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Generate password reset token
export const generatePasswordResetToken = (): string => {
  const token = crypto.randomBytes(32).toString('hex');
  return crypto.createHash('sha256').update(token).digest('hex');
};

// Hash password reset token for storage
export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// Generate API key for external integrations
export const generateApiKey = (userId: string): string => {
  const timestamp = Date.now().toString();
  const random = crypto.randomBytes(16).toString('hex');
  const payload = `${userId}:${timestamp}:${random}`;
  
  return Buffer.from(payload).toString('base64');
};

// Validate API key
export const validateApiKey = (apiKey: string): { userId: string; timestamp: number } | null => {
  try {
    const decoded = Buffer.from(apiKey, 'base64').toString('utf-8');
    const [userId, timestamp, random] = decoded.split(':');
    
    if (!userId || !timestamp || !random) {
      return null;
    }
    
    return {
      userId,
      timestamp: parseInt(timestamp)
    };
  } catch (error) {
    return null;
  }
};

// Generate secure session ID
export const generateSessionId = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Generate file share token
export const generateShareToken = (): string => {
  return crypto.randomBytes(16).toString('hex');
};

// Generate one-time access code
export const generateAccessCode = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

// Generate webhook secret
export const generateWebhookSecret = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Create HMAC signature for webhooks
export const createWebhookSignature = (payload: string, secret: string): string => {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
};

// Verify webhook signature
export const verifyWebhookSignature = (
  payload: string, 
  signature: string, 
  secret: string
): boolean => {
  const expectedSignature = createWebhookSignature(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
};