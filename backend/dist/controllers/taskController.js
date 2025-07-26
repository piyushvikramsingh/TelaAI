"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskController = void 0;
const express_validator_1 = require("express-validator");
const Task_1 = require("../models/Task");
const openai_1 = require("../services/openai");
const logger_1 = require("../utils/logger");
class TaskController {
    /**
     * Create a new task
     */
    static async createTask(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
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
            const task = new Task_1.Task({
                userId,
                title,
                description,
                category,
                priority,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                aiGenerated
            });
            await task.save();
            logger_1.logger.info('Task created', { userId, taskId: task._id, title });
            res.status(201).json({
                success: true,
                data: { task },
                message: 'Task created successfully'
            });
        }
        catch (error) {
            logger_1.logger.error('Create task failed', { error });
            res.status(500).json({
                success: false,
                message: 'Failed to create task'
            });
        }
    }
    /**
     * Get user tasks with filters
     */
    static async getTasks(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const userId = req.user._id;
            // Parse filters
            const filters = {};
            if (req.query.status)
                filters.status = req.query.status.split(',');
            if (req.query.category)
                filters.category = req.query.category.split(',');
            if (req.query.priority)
                filters.priority = req.query.priority.split(',');
            if (req.query.overdue === 'true')
                filters.overdue = true;
            const tasks = await Task_1.Task.getUserTasks(userId, filters, page, limit);
            const total = await Task_1.Task.countDocuments({ userId, ...filters });
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
        }
        catch (error) {
            logger_1.logger.error('Get tasks failed', { error });
            res.status(500).json({
                success: false,
                message: 'Failed to get tasks'
            });
        }
    }
    /**
     * Get specific task
     */
    static async getTask(req, res) {
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
            const task = await Task_1.Task.findOne({ _id: taskId, userId });
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
        }
        catch (error) {
            logger_1.logger.error('Get task failed', { error });
            res.status(500).json({
                success: false,
                message: 'Failed to get task'
            });
        }
    }
    /**
     * Update task
     */
    static async updateTask(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
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
            const task = await Task_1.Task.findOne({ _id: taskId, userId });
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
                    task[key] = updates[key];
                }
            });
            if (updates.dueDate) {
                task.dueDate = new Date(updates.dueDate);
            }
            await task.save();
            logger_1.logger.info('Task updated', { userId, taskId, updates: Object.keys(updates) });
            res.status(200).json({
                success: true,
                data: { task },
                message: 'Task updated successfully'
            });
        }
        catch (error) {
            logger_1.logger.error('Update task failed', { error });
            res.status(500).json({
                success: false,
                message: 'Failed to update task'
            });
        }
    }
    /**
     * Delete task
     */
    static async deleteTask(req, res) {
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
            const task = await Task_1.Task.findOneAndDelete({ _id: taskId, userId });
            if (!task) {
                res.status(404).json({
                    success: false,
                    message: 'Task not found'
                });
                return;
            }
            logger_1.logger.info('Task deleted', { userId, taskId });
            res.status(200).json({
                success: true,
                message: 'Task deleted successfully'
            });
        }
        catch (error) {
            logger_1.logger.error('Delete task failed', { error });
            res.status(500).json({
                success: false,
                message: 'Failed to delete task'
            });
        }
    }
    /**
     * Generate AI task suggestions
     */
    static async generateTasks(req, res) {
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
            const existingTasks = await Task_1.Task.find({ userId })
                .select('title')
                .limit(20)
                .sort({ createdAt: -1 });
            const existingTitles = existingTasks.map(task => task.title);
            // Generate task suggestions
            const suggestions = await openai_1.OpenAIService.generateTaskSuggestions(context || 'General productivity and work tasks', existingTitles, category);
            // Create suggested tasks
            const generatedTasks = [];
            for (const suggestion of suggestions.slice(0, count)) {
                const task = new Task_1.Task({
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
            logger_1.logger.info('AI tasks generated', {
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
        }
        catch (error) {
            logger_1.logger.error('Generate tasks failed', { error });
            res.status(500).json({
                success: false,
                message: 'Failed to generate tasks'
            });
        }
    }
    /**
     * Get task statistics
     */
    static async getStats(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }
            const userId = req.user._id;
            const stats = await Task_1.Task.getUserTaskStats(userId);
            const upcomingDeadlines = await Task_1.Task.getUpcomingDeadlines(userId, 7);
            res.status(200).json({
                success: true,
                data: {
                    stats,
                    upcomingDeadlines
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Get task stats failed', { error });
            res.status(500).json({
                success: false,
                message: 'Failed to get task statistics'
            });
        }
    }
    /**
     * Mark task as completed
     */
    static async completeTask(req, res) {
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
            const task = await Task_1.Task.findOne({ _id: taskId, userId });
            if (!task) {
                res.status(404).json({
                    success: false,
                    message: 'Task not found'
                });
                return;
            }
            await task.markCompleted();
            logger_1.logger.info('Task completed', { userId, taskId });
            res.status(200).json({
                success: true,
                data: { task },
                message: 'Task marked as completed'
            });
        }
        catch (error) {
            logger_1.logger.error('Complete task failed', { error });
            res.status(500).json({
                success: false,
                message: 'Failed to complete task'
            });
        }
    }
}
exports.TaskController = TaskController;
//# sourceMappingURL=taskController.js.map