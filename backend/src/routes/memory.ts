import { Router, Request, Response } from 'express';
import { Memory } from '../models/Memory';
import { authenticate } from '../middleware/auth';
import { catchAsync, AppError } from '../middleware/errorHandler';

const router = Router();
router.use(authenticate);

// Get all memories for user
router.get('/', catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const memories = await Memory.find({ userId, isActive: true }).sort({ createdAt: -1 });
  
  res.json({
    status: 'success',
    data: { memories }
  });
}));

// Create new memory
router.post('/', catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const memory = new Memory({ ...req.body, userId });
  await memory.save();

  res.status(201).json({
    status: 'success',
    data: { memory }
  });
}));

// Get specific memory
router.get('/:id', catchAsync(async (req: Request, res: Response) => {
  const memory = await Memory.findOne({ _id: req.params.id, userId: req.user!._id });
  
  if (!memory) {
    throw new AppError('Memory not found', 404);
  }

  res.json({
    status: 'success',
    data: { memory }
  });
}));

export default router;