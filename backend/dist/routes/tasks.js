"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const taskController_1 = require("../controllers/taskController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
// All task routes require authentication
router.use(auth_1.authenticateToken);
// Create task
router.post('/', validation_1.validateTask, taskController_1.TaskController.createTask);
// Get tasks with filters and pagination
router.get('/', validation_1.validatePagination, taskController_1.TaskController.getTasks);
// Get task statistics
router.get('/stats', taskController_1.TaskController.getStats);
// Generate AI task suggestions (requires credits)
router.post('/generate', (0, auth_1.checkCredits)(2), taskController_1.TaskController.generateTasks);
// Get specific task
router.get('/:taskId', (0, validation_1.validateMongoId)('taskId'), taskController_1.TaskController.getTask);
// Update task
router.put('/:taskId', validation_1.validateTaskUpdate, taskController_1.TaskController.updateTask);
// Complete task
router.post('/:taskId/complete', (0, validation_1.validateMongoId)('taskId'), taskController_1.TaskController.completeTask);
// Delete task
router.delete('/:taskId', (0, validation_1.validateMongoId)('taskId'), taskController_1.TaskController.deleteTask);
exports.default = router;
//# sourceMappingURL=tasks.js.map