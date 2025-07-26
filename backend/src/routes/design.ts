import { Router, Request, Response } from 'express';
import { Design } from '../models/Design';
import { authenticate } from '../middleware/auth';
import { catchAsync, AppError } from '../middleware/errorHandler';

const router = Router();
router.use(authenticate);

// Get all designs for user
router.get('/', catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const designs = await Design.find({ userId }).sort({ createdAt: -1 });
  
  res.json({
    status: 'success',
    data: { designs }
  });
}));

// Create new design
router.post('/', catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const design = new Design({ ...req.body, userId });
  await design.save();

  res.status(201).json({
    status: 'success',
    data: { design }
  });
}));

// Get specific design
router.get('/:id', catchAsync(async (req: Request, res: Response) => {
  const design = await Design.findOne({ _id: req.params.id, userId: req.user!._id });
  
  if (!design) {
    throw new AppError('Design not found', 404);
  }

  res.json({
    status: 'success',
    data: { design }
  });
}));

export default router;