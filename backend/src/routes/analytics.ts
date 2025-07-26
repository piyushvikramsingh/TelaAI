import { Router, Request, Response } from 'express';
import { User } from '../models/User';
import { Chat } from '../models/Chat';
import { Task } from '../models/Task';
import { File } from '../models/File';
import { authenticate } from '../middleware/auth';
import { catchAsync } from '../middleware/errorHandler';

const router = Router();
router.use(authenticate);

// Get user analytics dashboard
router.get('/dashboard', catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!._id;

  const [chatCount, taskCount, fileCount, user] = await Promise.all([
    Chat.countDocuments({ userId }),
    Task.countDocuments({ userId }),
    File.countDocuments({ userId }),
    User.findById(userId)
  ]);

  const analytics = {
    overview: {
      totalChats: chatCount,
      totalTasks: taskCount,
      totalFiles: fileCount,
      tokensUsed: user?.usage.aiTokensUsed || 0,
      tokensLimit: user?.usage.aiTokensLimit || 0
    },
    usage: user?.usage || {},
    subscription: user?.subscription || {}
  };

  res.json({
    status: 'success',
    data: { analytics }
  });
}));

export default router;