import { body, param, query, ValidationChain } from 'express-validator';

// Auth validation
export const validateRegister: ValidationChain[] = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
];

export const validateLogin: ValidationChain[] = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Chat validation
export const validateChatMessage: ValidationChain[] = [
  body('message')
    .trim()
    .isLength({ min: 1, max: 4000 })
    .withMessage('Message must be between 1 and 4000 characters'),
  body('conversationId')
    .optional()
    .isMongoId()
    .withMessage('Invalid conversation ID'),
];

export const validateConversationId: ValidationChain[] = [
  param('conversationId')
    .isMongoId()
    .withMessage('Invalid conversation ID'),
];

// Task validation
export const validateTask: ValidationChain[] = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('category')
    .optional()
    .isIn(['coding', 'design', 'analysis', 'writing', 'other'])
    .withMessage('Invalid category'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date'),
];

export const validateTaskUpdate: ValidationChain[] = [
  param('taskId')
    .isMongoId()
    .withMessage('Invalid task ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('category')
    .optional()
    .isIn(['coding', 'design', 'analysis', 'writing', 'other'])
    .withMessage('Invalid category'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),
  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date'),
];

// Memory validation
export const validateMemoryEntry: ValidationChain[] = [
  body('type')
    .isIn(['preference', 'context', 'skill', 'project', 'note'])
    .withMessage('Invalid memory type'),
  body('key')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Key must be between 1 and 100 characters'),
  body('value')
    .notEmpty()
    .withMessage('Value is required'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('importance')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Importance must be between 1 and 10'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each tag must be between 1 and 30 characters'),
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Expiration date must be a valid ISO 8601 date'),
];

export const validateMemoryUpdate: ValidationChain[] = [
  param('memoryId')
    .isMongoId()
    .withMessage('Invalid memory ID'),
  ...validateMemoryEntry.map(chain => chain.optional()),
];

// Design validation
export const validateDesignProject: ValidationChain[] = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('type')
    .isIn(['ui', 'logo', 'banner', 'illustration', 'other'])
    .withMessage('Invalid design type'),
  body('prompt')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Prompt must be between 1 and 1000 characters'),
];

export const validateDesignProjectUpdate: ValidationChain[] = [
  param('projectId')
    .isMongoId()
    .withMessage('Invalid project ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('status')
    .optional()
    .isIn(['generating', 'completed', 'failed'])
    .withMessage('Invalid status'),
];

// File validation
export const validateFileUpload: ValidationChain[] = [
  body('category')
    .optional()
    .isIn(['image', 'document', 'code', 'data', 'other'])
    .withMessage('Invalid file category'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
];

// Query validation
export const validatePagination: ValidationChain[] = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

export const validateSearch: ValidationChain[] = [
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),
];

// Generic ID validation
export const validateMongoId = (paramName: string): ValidationChain[] => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName}`),
];