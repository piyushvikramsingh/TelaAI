import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models/User';
import { generateTokenPair, generateEmailVerificationToken, generatePasswordResetToken, hashToken } from '../utils/jwt';
import { authenticate, verifyRefreshToken } from '../middleware/auth';
import { catchAsync, AppError } from '../middleware/errorHandler';
import { logger, logSecurityEvent } from '../utils/logger';
import crypto from 'crypto';

const router = Router();

// Validation rules
const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-30 characters and contain only letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, and number'),
  body('firstName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  body('lastName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
];

const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, and number')
];

// Register new user
router.post('/register', registerValidation, catchAsync(async (req: Request, res: Response) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400);
  }

  const { username, email, password, firstName, lastName } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existingUser) {
    throw new AppError('User with this email or username already exists', 409);
  }

  // Create user
  const verificationToken = generateEmailVerificationToken();
  const user = new User({
    username,
    email,
    password,
    firstName,
    lastName,
    verificationToken,
    isVerified: process.env.NODE_ENV === 'development' // Auto-verify in development
  });

  await user.save();

  // Generate tokens
  const tokens = generateTokenPair(user);
  await user.save(); // Save refresh token

  logSecurityEvent('user_registered', user._id.toString(), req.ip, { username, email });

  res.status(201).json({
    status: 'success',
    message: 'User registered successfully',
    data: {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: user.isVerified,
        subscription: user.subscription,
        preferences: user.preferences
      },
      tokens
    }
  });
}));

// Login user
router.post('/login', loginValidation, catchAsync(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400);
  }

  const { email, password } = req.body;

  // Find user and include password for comparison
  const user = await User.findOne({ email }).select('+password');
  
  if (!user || !(await user.comparePassword(password))) {
    logSecurityEvent('login_failed', undefined, req.ip, { email });
    throw new AppError('Invalid email or password', 401);
  }

  // Check if user is verified
  if (!user.isVerified) {
    throw new AppError('Please verify your email before logging in', 401);
  }

  // Generate tokens
  const tokens = generateTokenPair(user);
  
  // Update last login
  user.lastLogin = new Date();
  await user.save();

  logSecurityEvent('login_success', user._id.toString(), req.ip, { email });

  res.json({
    status: 'success',
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: user.isVerified,
        subscription: user.subscription,
        preferences: user.preferences,
        lastLogin: user.lastLogin
      },
      tokens
    }
  });
}));

// Refresh access token
router.post('/refresh-token', verifyRefreshToken, catchAsync(async (req: Request, res: Response) => {
  const user = req.user!;
  const oldRefreshToken = (req as any).refreshToken;

  // Remove old refresh token
  user.removeRefreshToken(oldRefreshToken);

  // Generate new tokens
  const tokens = generateTokenPair(user);
  await user.save();

  res.json({
    status: 'success',
    message: 'Tokens refreshed successfully',
    data: { tokens }
  });
}));

// Logout user
router.post('/logout', authenticate, catchAsync(async (req: Request, res: Response) => {
  const user = req.user!;
  const refreshToken = req.headers['x-refresh-token'] as string;

  if (refreshToken) {
    user.removeRefreshToken(refreshToken);
    await user.save();
  }

  logSecurityEvent('logout', user._id.toString(), req.ip);

  res.json({
    status: 'success',
    message: 'Logged out successfully'
  });
}));

// Logout from all devices
router.post('/logout-all', authenticate, catchAsync(async (req: Request, res: Response) => {
  const user = req.user!;
  
  // Clear all refresh tokens
  user.refreshTokens = [];
  await user.save();

  logSecurityEvent('logout_all_devices', user._id.toString(), req.ip);

  res.json({
    status: 'success',
    message: 'Logged out from all devices successfully'
  });
}));

// Verify email
router.get('/verify-email/:token', catchAsync(async (req: Request, res: Response) => {
  const { token } = req.params;

  const user = await User.findOne({ verificationToken: token });
  
  if (!user) {
    throw new AppError('Invalid or expired verification token', 400);
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save();

  logSecurityEvent('email_verified', user._id.toString(), req.ip);

  res.json({
    status: 'success',
    message: 'Email verified successfully'
  });
}));

// Resend verification email
router.post('/resend-verification', catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError('Email is required', 400);
  }

  const user = await User.findOne({ email });
  
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.isVerified) {
    throw new AppError('Email is already verified', 400);
  }

  // Generate new verification token
  user.verificationToken = generateEmailVerificationToken();
  await user.save();

  // TODO: Send verification email

  res.json({
    status: 'success',
    message: 'Verification email sent successfully'
  });
}));

// Forgot password
router.post('/forgot-password', forgotPasswordValidation, catchAsync(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400);
  }

  const { email } = req.body;

  const user = await User.findOne({ email });
  
  if (!user) {
    // Don't reveal if user exists
    res.json({
      status: 'success',
      message: 'If an account with that email exists, a password reset link has been sent'
    });
    return;
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = hashToken(resetToken);
  user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await user.save();

  logSecurityEvent('password_reset_requested', user._id.toString(), req.ip);

  // TODO: Send password reset email with resetToken

  res.json({
    status: 'success',
    message: 'If an account with that email exists, a password reset link has been sent'
  });
}));

// Reset password
router.post('/reset-password', resetPasswordValidation, catchAsync(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400);
  }

  const { token, password } = req.body;

  // Hash the token to compare with stored hash
  const hashedToken = hashToken(token);

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() }
  });

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  // Update password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  
  // Clear all refresh tokens for security
  user.refreshTokens = [];
  
  await user.save();

  logSecurityEvent('password_reset_completed', user._id.toString(), req.ip);

  res.json({
    status: 'success',
    message: 'Password reset successfully'
  });
}));

// Change password (authenticated)
router.post('/change-password', authenticate, catchAsync(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError('Current and new passwords are required', 400);
  }

  if (newPassword.length < 8 || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
    throw new AppError('New password must be at least 8 characters with uppercase, lowercase, and number', 400);
  }

  const user = await User.findById(req.user!._id).select('+password');
  
  if (!user || !(await user.comparePassword(currentPassword))) {
    throw new AppError('Current password is incorrect', 401);
  }

  user.password = newPassword;
  // Clear all refresh tokens except current session
  user.refreshTokens = [];
  
  await user.save();

  logSecurityEvent('password_changed', user._id.toString(), req.ip);

  res.json({
    status: 'success',
    message: 'Password changed successfully'
  });
}));

// Get current user profile
router.get('/me', authenticate, catchAsync(async (req: Request, res: Response) => {
  const user = req.user!;

  res.json({
    status: 'success',
    data: {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        role: user.role,
        isVerified: user.isVerified,
        subscription: user.subscription,
        preferences: user.preferences,
        usage: user.usage,
        lastLogin: user.lastLogin,
        lastActive: user.lastActive,
        createdAt: user.createdAt
      }
    }
  });
}));

// Update user profile
router.patch('/me', authenticate, catchAsync(async (req: Request, res: Response) => {
  const user = req.user!;
  const allowedUpdates = ['firstName', 'lastName', 'preferences'];
  const updates = Object.keys(req.body);
  
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));
  
  if (!isValidOperation) {
    throw new AppError('Invalid updates', 400);
  }

  updates.forEach(update => {
    (user as any)[update] = req.body[update];
  });

  await user.save();

  res.json({
    status: 'success',
    message: 'Profile updated successfully',
    data: { user }
  });
}));

// Delete account
router.delete('/me', authenticate, catchAsync(async (req: Request, res: Response) => {
  const { password } = req.body;

  if (!password) {
    throw new AppError('Password confirmation is required', 400);
  }

  const user = await User.findById(req.user!._id).select('+password');
  
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Password is incorrect', 401);
  }

  await User.findByIdAndDelete(user._id);

  logSecurityEvent('account_deleted', user._id.toString(), req.ip);

  res.json({
    status: 'success',
    message: 'Account deleted successfully'
  });
}));

export default router;