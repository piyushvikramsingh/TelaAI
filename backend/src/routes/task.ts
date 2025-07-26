import { Router, Request, Response } from 'express';
import { Task } from '../models/Task';
import { authenticate, checkUsageLimit } from '../middleware/auth';
import { catchAsync, AppError } from '../middleware/errorHandler';

const router = Router();
router.use(authenticate);

// Get all tasks for user
router.get('/', catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const tasks = await Task.find({ userId }).sort({ createdAt: -1 });
  
  res.json({
    status: 'success',
    data: { tasks }
  });
}));

// Create new task
router.post('/', checkUsageLimit('tasks'), catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const task = new Task({ ...req.body, userId });
  await task.save();

  res.status(201).json({
    status: 'success',
    data: { task }
  });
}));

// Get specific task
router.get('/:id', catchAsync(async (req: Request, res: Response) => {
  const task = await Task.findOne({ _id: req.params.id, userId: req.user!._id });
  
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  res.json({
    status: 'success',
    data: { task }
  });
}));

// Update task
router.patch('/:id', catchAsync(async (req: Request, res: Response) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, userId: req.user!._id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  res.json({
    status: 'success',
    data: { task }
  });
}));

// Delete task
router.delete('/:id', catchAsync(async (req: Request, res: Response) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user!._id });

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  res.json({
    status: 'success',
    message: 'Task deleted successfully'
  });
}));

export default router;