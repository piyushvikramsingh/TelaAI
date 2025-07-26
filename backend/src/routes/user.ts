import { Router, Request, Response } from 'express';
import { User } from '../models/User';
import { authenticate, authorize } from '../middleware/auth';
import { catchAsync, AppError } from '../middleware/errorHandler';

const router = Router();

// Get all users (admin only)
router.get('/', authenticate, authorize('admin'), catchAsync(async (req: Request, res: Response) => {
  const users = await User.find().select('-password -refreshTokens');
  
  res.json({
    status: 'success',
    data: { users }
  });
}));

// Get user by ID (admin only)
router.get('/:id', authenticate, authorize('admin'), catchAsync(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id).select('-password -refreshTokens');
  
  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    status: 'success',
    data: { user }
  });
}));

// Update user (admin only)
router.patch('/:id', authenticate, authorize('admin'), catchAsync(async (req: Request, res: Response) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).select('-password -refreshTokens');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    status: 'success',
    data: { user }
  });
}));

export default router;