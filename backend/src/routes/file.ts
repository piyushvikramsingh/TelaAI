import { Router, Request, Response } from 'express';
import { File } from '../models/File';
import { authenticate, checkUsageLimit } from '../middleware/auth';
import { catchAsync, AppError } from '../middleware/errorHandler';

const router = Router();
router.use(authenticate);

// Get all files for user
router.get('/', catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const files = await File.find({ userId }).sort({ createdAt: -1 });
  
  res.json({
    status: 'success',
    data: { files }
  });
}));

// Upload file
router.post('/', checkUsageLimit('files'), catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const file = new File({ ...req.body, userId });
  await file.save();

  res.status(201).json({
    status: 'success',
    data: { file }
  });
}));

// Get specific file
router.get('/:id', catchAsync(async (req: Request, res: Response) => {
  const file = await File.findOne({ _id: req.params.id, userId: req.user!._id });
  
  if (!file) {
    throw new AppError('File not found', 404);
  }

  res.json({
    status: 'success',
    data: { file }
  });
}));

// Delete file
router.delete('/:id', catchAsync(async (req: Request, res: Response) => {
  const file = await File.findOneAndDelete({ _id: req.params.id, userId: req.user!._id });

  if (!file) {
    throw new AppError('File not found', 404);
  }

  res.json({
    status: 'success',
    message: 'File deleted successfully'
  });
}));

export default router;