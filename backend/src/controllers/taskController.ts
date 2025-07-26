import { Response } from 'express';
import { validationResult } from 'express-validator';
import { Task } from '../models/Task';
import { AuthenticatedRequest, ApiResponse } from '../types';
import { OpenAIService } from '../services/openai';
import { logger } from '../utils/logger';

export class TaskController {
  /**
   * Create a new task
   */
  static async createTask(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array().map(err => err.msg)
        });
        return;
      }

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const { title, description, category, priority, dueDate, aiGenerated = false } = req.body;
      const userId = req.user._id;

      const task = new Task({
        userId,
        title,
        description,
        category,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        aiGenerated
      });

      await task.save();

      logger.info('Task created', { userId, taskId: task._id, title });

      res.status(201).json({
        success: true,
        data: { task },
        message: 'Task created successfully'
      });
    } catch (error) {
      logger.error('Create task failed', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to create task'
      });
    }
  }

  /**
   * Get user tasks with filters
   */
  static async getTasks(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const userId = req.user._id;

      // Parse filters
      const filters: any = {};
      if (req.query.status) filters.status = (req.query.status as string).split(',');
      if (req.query.category) filters.category = (req.query.category as string).split(',');
      if (req.query.priority) filters.priority = (req.query.priority as string).split(',');
      if (req.query.overdue === 'true') filters.overdue = true;

      const tasks = await Task.getUserTasks(userId, filters, page, limit);
      const total = await Task.countDocuments({ userId, ...filters });

      res.status(200).json({
        success: true,
        data: { tasks },
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Get tasks failed', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to get tasks'
      });
    }
  }

  /**
   * Get specific task
   */
  static async getTask(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const { taskId } = req.params;
      const userId = req.user._id;

      const task = await Task.findOne({ _id: taskId, userId });

      if (!task) {
        res.status(404).json({
          success: false,
          message: 'Task not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { task }
      });
    } catch (error) {
      logger.error('Get task failed', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to get task'
      });
    }
  }

  /**
   * Update task
   */
  static async updateTask(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array().map(err => err.msg)
        });
        return;
      }

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const { taskId } = req.params;
      const userId = req.user._id;
      const updates = req.body;

      const task = await Task.findOne({ _id: taskId, userId });

      if (!task) {
        res.status(404).json({
          success: false,
          message: 'Task not found'
        });
        return;
      }

      // Update fields
      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined) {
          (task as any)[key] = updates[key];
        }
      });

      if (updates.dueDate) {
        task.dueDate = new Date(updates.dueDate);
      }

      await task.save();

      logger.info('Task updated', { userId, taskId, updates: Object.keys(updates) });

      res.status(200).json({
        success: true,
        data: { task },
        message: 'Task updated successfully'
      });
    } catch (error) {
      logger.error('Update task failed', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to update task'
      });
    }
  }

  /**
   * Delete task
   */
  static async deleteTask(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const { taskId } = req.params;
      const userId = req.user._id;

      const task = await Task.findOneAndDelete({ _id: taskId, userId });

      if (!task) {
        res.status(404).json({
          success: false,
          message: 'Task not found'
        });
        return;
      }

      logger.info('Task deleted', { userId, taskId });

      res.status(200).json({
        success: true,
        message: 'Task deleted successfully'
      });
    } catch (error) {
      logger.error('Delete task failed', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to delete task'
      });
    }
  }

  /**
   * Generate AI task suggestions
   */
  static async generateTasks(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const { context, category, count = 3 } = req.body;
      const userId = req.user._id;

      // Check user credits
      if (req.user.credits < 2) {
        res.status(402).json({
          success: false,
          message: 'Insufficient credits for AI task generation'
        });
        return;
      }

      // Get existing tasks to avoid duplicates
      const existingTasks = await Task.find({ userId })
        .select('title')
        .limit(20)
        .sort({ createdAt: -1 });

      const existingTitles = existingTasks.map(task => task.title);

      // Generate task suggestions
      const suggestions = await OpenAIService.generateTaskSuggestions(
        context || 'General productivity and work tasks',
        existingTitles,
        category
      );

      // Create suggested tasks
      const generatedTasks = [];
      for (const suggestion of suggestions.slice(0, count)) {
        const task = new Task({
          userId,
          title: suggestion,
          category: category || 'other',
          priority: 'medium',
          aiGenerated: true
        });

        await task.save();
        generatedTasks.push(task);
      }

      // Deduct credits
      await req.user.deductCredits(2);

      logger.info('AI tasks generated', { 
        userId, 
        count: generatedTasks.length,
        category 
      });

      res.status(201).json({
        success: true,
        data: { 
          tasks: generatedTasks,
          generated: generatedTasks.length
        },
        message: `Generated ${generatedTasks.length} task suggestions`
      });
    } catch (error) {
      logger.error('Generate tasks failed', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to generate tasks'
      });
    }
  }

  /**
   * Get task statistics
   */
  static async getStats(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const userId = req.user._id;
      const stats = await Task.getUserTaskStats(userId);
      const upcomingDeadlines = await Task.getUpcomingDeadlines(userId, 7);

      res.status(200).json({
        success: true,
        data: {
          stats,
          upcomingDeadlines
        }
      });
    } catch (error) {
      logger.error('Get task stats failed', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to get task statistics'
      });
    }
  }

  /**
   * Mark task as completed
   */
  static async completeTask(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const { taskId } = req.params;
      const userId = req.user._id;

      const task = await Task.findOne({ _id: taskId, userId });

      if (!task) {
        res.status(404).json({
          success: false,
          message: 'Task not found'
        });
        return;
      }

      await task.markCompleted();

      logger.info('Task completed', { userId, taskId });

      res.status(200).json({
        success: true,
        data: { task },
        message: 'Task marked as completed'
      });
    } catch (error) {
      logger.error('Complete task failed', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to complete task'
      });
    }
  }
}