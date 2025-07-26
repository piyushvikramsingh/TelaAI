"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateMongoId = exports.validateSearch = exports.validatePagination = exports.validateFileUpload = exports.validateDesignProjectUpdate = exports.validateDesignProject = exports.validateMemoryUpdate = exports.validateMemoryEntry = exports.validateTaskUpdate = exports.validateTask = exports.validateConversationId = exports.validateChatMessage = exports.validateLogin = exports.validateRegister = void 0;
const express_validator_1 = require("express-validator");
// Auth validation
exports.validateRegister = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email is required'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    (0, express_validator_1.body)('firstName')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('First name must be between 1 and 50 characters'),
    (0, express_validator_1.body)('lastName')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Last name must be between 1 and 50 characters'),
];
exports.validateLogin = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email is required'),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required'),
];
// Chat validation
exports.validateChatMessage = [
    (0, express_validator_1.body)('message')
        .trim()
        .isLength({ min: 1, max: 4000 })
        .withMessage('Message must be between 1 and 4000 characters'),
    (0, express_validator_1.body)('conversationId')
        .optional()
        .isMongoId()
        .withMessage('Invalid conversation ID'),
];
exports.validateConversationId = [
    (0, express_validator_1.param)('conversationId')
        .isMongoId()
        .withMessage('Invalid conversation ID'),
];
// Task validation
exports.validateTask = [
    (0, express_validator_1.body)('title')
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Title must be between 1 and 200 characters'),
    (0, express_validator_1.body)('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Description must be less than 1000 characters'),
    (0, express_validator_1.body)('category')
        .optional()
        .isIn(['coding', 'design', 'analysis', 'writing', 'other'])
        .withMessage('Invalid category'),
    (0, express_validator_1.body)('priority')
        .optional()
        .isIn(['low', 'medium', 'high', 'urgent'])
        .withMessage('Invalid priority'),
    (0, express_validator_1.body)('dueDate')
        .optional()
        .isISO8601()
        .withMessage('Due date must be a valid ISO 8601 date'),
];
exports.validateTaskUpdate = [
    (0, express_validator_1.param)('taskId')
        .isMongoId()
        .withMessage('Invalid task ID'),
    (0, express_validator_1.body)('title')
        .optional()
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Title must be between 1 and 200 characters'),
    (0, express_validator_1.body)('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Description must be less than 1000 characters'),
    (0, express_validator_1.body)('category')
        .optional()
        .isIn(['coding', 'design', 'analysis', 'writing', 'other'])
        .withMessage('Invalid category'),
    (0, express_validator_1.body)('priority')
        .optional()
        .isIn(['low', 'medium', 'high', 'urgent'])
        .withMessage('Invalid priority'),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['pending', 'in_progress', 'completed', 'cancelled'])
        .withMessage('Invalid status'),
    (0, express_validator_1.body)('dueDate')
        .optional()
        .isISO8601()
        .withMessage('Due date must be a valid ISO 8601 date'),
];
// Memory validation
exports.validateMemoryEntry = [
    (0, express_validator_1.body)('type')
        .isIn(['preference', 'context', 'skill', 'project', 'note'])
        .withMessage('Invalid memory type'),
    (0, express_validator_1.body)('key')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Key must be between 1 and 100 characters'),
    (0, express_validator_1.body)('value')
        .notEmpty()
        .withMessage('Value is required'),
    (0, express_validator_1.body)('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must be less than 500 characters'),
    (0, express_validator_1.body)('importance')
        .optional()
        .isInt({ min: 1, max: 10 })
        .withMessage('Importance must be between 1 and 10'),
    (0, express_validator_1.body)('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array'),
    (0, express_validator_1.body)('tags.*')
        .optional()
        .trim()
        .isLength({ min: 1, max: 30 })
        .withMessage('Each tag must be between 1 and 30 characters'),
    (0, express_validator_1.body)('expiresAt')
        .optional()
        .isISO8601()
        .withMessage('Expiration date must be a valid ISO 8601 date'),
];
exports.validateMemoryUpdate = [
    (0, express_validator_1.param)('memoryId')
        .isMongoId()
        .withMessage('Invalid memory ID'),
    ...exports.validateMemoryEntry.map(chain => chain.optional()),
];
// Design validation
exports.validateDesignProject = [
    (0, express_validator_1.body)('name')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Name must be between 1 and 100 characters'),
    (0, express_validator_1.body)('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must be less than 500 characters'),
    (0, express_validator_1.body)('type')
        .isIn(['ui', 'logo', 'banner', 'illustration', 'other'])
        .withMessage('Invalid design type'),
    (0, express_validator_1.body)('prompt')
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage('Prompt must be between 1 and 1000 characters'),
];
exports.validateDesignProjectUpdate = [
    (0, express_validator_1.param)('projectId')
        .isMongoId()
        .withMessage('Invalid project ID'),
    (0, express_validator_1.body)('name')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Name must be between 1 and 100 characters'),
    (0, express_validator_1.body)('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must be less than 500 characters'),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['generating', 'completed', 'failed'])
        .withMessage('Invalid status'),
];
// File validation
exports.validateFileUpload = [
    (0, express_validator_1.body)('category')
        .optional()
        .isIn(['image', 'document', 'code', 'data', 'other'])
        .withMessage('Invalid file category'),
    (0, express_validator_1.body)('isPublic')
        .optional()
        .isBoolean()
        .withMessage('isPublic must be a boolean'),
];
// Query validation
exports.validatePagination = [
    (0, express_validator_1.query)('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
];
exports.validateSearch = [
    (0, express_validator_1.query)('search')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Search term must be between 1 and 100 characters'),
];
// Generic ID validation
const validateMongoId = (paramName) => [
    (0, express_validator_1.param)(paramName)
        .isMongoId()
        .withMessage(`Invalid ${paramName}`),
];
exports.validateMongoId = validateMongoId;
//# sourceMappingURL=validation.js.map