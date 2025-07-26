import { Router } from 'express';
import { TaskController } from '../controllers/taskController';
import { authenticateToken, checkCredits } from '../middleware/auth';
import { 
  validateTask, 
  validateTaskUpdate, 
  validatePagination,
  validateMongoId
} from '../middleware/validation';

const router = Router();

// All task routes require authentication
router.use(authenticateToken);

// Create task
router.post('/', validateTask, TaskController.createTask);

// Get tasks with filters and pagination
router.get('/', validatePagination, TaskController.getTasks);

// Get task statistics
router.get('/stats', TaskController.getStats);

// Generate AI task suggestions (requires credits)
router.post('/generate', checkCredits(2), TaskController.generateTasks);

// Get specific task
router.get('/:taskId', validateMongoId('taskId'), TaskController.getTask);

// Update task
router.put('/:taskId', validateTaskUpdate, TaskController.updateTask);

// Complete task
router.post('/:taskId/complete', validateMongoId('taskId'), TaskController.completeTask);

// Delete task
router.delete('/:taskId', validateMongoId('taskId'), TaskController.deleteTask);

export default router;