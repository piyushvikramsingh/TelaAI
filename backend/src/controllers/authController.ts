import { Response } from 'express';
import { validationResult } from 'express-validator';
import { User } from '../models/User';
import { AuthenticatedRequest, ApiResponse } from '../types';
import { generateToken } from '../middleware/auth';
import { logger } from '../utils/logger';

export class AuthController {
  /**
   * Register a new user
   */
  static async register(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array().map(err => err.msg)
        });
        return;
      }

      const { email, password, firstName, lastName } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(409).json({
          success: false,
          message: 'User already exists with this email'
        });
        return;
      }

      // Create new user
      const user = new User({
        email,
        password, // Will be hashed by pre-save middleware
        firstName,
        lastName,
      });

      await user.save();

      // Generate JWT token
      const token = generateToken(user._id);

      logger.info('User registered successfully', { userId: user._id, email });

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            plan: user.plan,
            credits: user.credits,
          },
          token
        },
        message: 'Registration successful'
      });
    } catch (error) {
      logger.error('Registration failed', { error });
      res.status(500).json({
        success: false,
        message: 'Registration failed'
      });
    }
  }

  /**
   * Login user
   */
  static async login(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array().map(err => err.msg)
        });
        return;
      }

      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
        return;
      }

      // Check if user is active
      if (!user.isActive) {
        res.status(401).json({
          success: false,
          message: 'Account is deactivated'
        });
        return;
      }

      // Verify password
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
        return;
      }

      // Update last login
      user.lastLoginAt = new Date();
      await user.save();

      // Generate JWT token
      const token = generateToken(user._id);

      logger.info('User logged in successfully', { userId: user._id, email });

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            plan: user.plan,
            credits: user.credits,
            lastLoginAt: user.lastLoginAt,
          },
          token
        },
        message: 'Login successful'
      });
    } catch (error) {
      logger.error('Login failed', { error });
      res.status(500).json({
        success: false,
        message: 'Login failed'
      });
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: req.user._id,
            email: req.user.email,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            avatar: req.user.avatar,
            plan: req.user.plan,
            credits: req.user.credits,
            isActive: req.user.isActive,
            lastLoginAt: req.user.lastLoginAt,
            createdAt: req.user.createdAt,
          }
        }
      });
    } catch (error) {
      logger.error('Get profile failed', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to get profile'
      });
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const { firstName, lastName, avatar } = req.body;
      const user = req.user;

      // Update only provided fields
      if (firstName !== undefined) user.firstName = firstName;
      if (lastName !== undefined) user.lastName = lastName;
      if (avatar !== undefined) user.avatar = avatar;

      await user.save();

      logger.info('Profile updated successfully', { userId: user._id });

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatar,
            plan: user.plan,
            credits: user.credits,
          }
        },
        message: 'Profile updated successfully'
      });
    } catch (error) {
      logger.error('Profile update failed', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to update profile'
      });
    }
  }

  /**
   * Change user password
   */
  static async changePassword(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const { currentPassword, newPassword } = req.body;

      // Verify current password
      const user = await User.findById(req.user._id).select('+password');
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      const isValidPassword = await user.comparePassword(currentPassword);
      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
        return;
      }

      // Update password (will be hashed by pre-save middleware)
      user.password = newPassword;
      await user.save();

      logger.info('Password changed successfully', { userId: user._id });

      res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      logger.error('Password change failed', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to change password'
      });
    }
  }

  /**
   * Deactivate user account
   */
  static async deactivateAccount(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const user = req.user;
      user.isActive = false;
      await user.save();

      logger.info('Account deactivated', { userId: user._id });

      res.status(200).json({
        success: true,
        message: 'Account deactivated successfully'
      });
    } catch (error) {
      logger.error('Account deactivation failed', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to deactivate account'
      });
    }
  }

  /**
   * Refresh token
   */
  static async refreshToken(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      // Generate new token
      const token = generateToken(req.user._id);

      res.status(200).json({
        success: true,
        data: { token },
        message: 'Token refreshed successfully'
      });
    } catch (error) {
      logger.error('Token refresh failed', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to refresh token'
      });
    }
  }
}