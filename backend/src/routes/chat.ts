import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { Chat, IMessage } from '../models/Chat';
import { User } from '../models/User';
import { authenticate, checkUsageLimit } from '../middleware/auth';
import { catchAsync, AppError } from '../middleware/errorHandler';
import { getChatCompletion, getChatCompletionStream, ChatMessage } from '../services/openai';
import { io } from '../server';
import { emitToUser } from '../config/socket';
import { logger } from '../utils/logger';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Validation rules
const createChatValidation = [
  body('title')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('initialMessage')
    .optional()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Initial message must be between 1 and 10000 characters')
];

const sendMessageValidation = [
  body('content')
    .isLength({ min: 1, max: 10000 })
    .withMessage('Message content must be between 1 and 10000 characters'),
  body('role')
    .optional()
    .isIn(['user', 'assistant', 'system'])
    .withMessage('Role must be user, assistant, or system')
];

const updateChatValidation = [
  body('title')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Each tag must be at most 50 characters')
];

// Get all chats for user
router.get('/', catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const search = req.query.search as string;
  const tags = req.query.tags as string;
  const isActive = req.query.isActive === 'true';

  // Build query
  const query: any = { userId };
  
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { 'messages.content': { $regex: search, $options: 'i' } }
    ];
  }
  
  if (tags) {
    const tagArray = tags.split(',').map(tag => tag.trim());
    query.tags = { $in: tagArray };
  }
  
  if (isActive !== undefined) {
    query.isActive = isActive;
  }

  const skip = (page - 1) * limit;

  const [chats, total] = await Promise.all([
    Chat.find(query)
      .sort({ lastMessageAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username email'),
    Chat.countDocuments(query)
  ]);

  res.json({
    status: 'success',
    data: {
      chats,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    }
  });
}));

// Get specific chat by ID
router.get('/:id', catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!._id;

  const chat = await Chat.findOne({ _id: id, userId }).populate('userId', 'username email');
  
  if (!chat) {
    throw new AppError('Chat not found', 404);
  }

  res.json({
    status: 'success',
    data: { chat }
  });
}));

// Create new chat
router.post('/', createChatValidation, catchAsync(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400);
  }

  const userId = req.user!._id;
  const { title, initialMessage } = req.body;

  const chat = new Chat({
    userId,
    title: title || 'New Chat',
    messages: []
  });

  // Add initial message if provided
  if (initialMessage) {
    chat.addMessage({
      role: 'user',
      content: initialMessage
    });
  }

  await chat.save();

  // Update user's task count
  const user = await User.findById(userId);
  if (user) {
    user.usage.tasksCreated += 1;
    await user.save();
  }

  res.status(201).json({
    status: 'success',
    data: { chat }
  });
}));

// Send message to chat
router.post('/:id/messages', 
  sendMessageValidation, 
  checkUsageLimit('aiTokens'),
  catchAsync(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    const { id } = req.params;
    const userId = req.user!._id;
    const { content, role = 'user' } = req.body;

    const chat = await Chat.findOne({ _id: id, userId });
    
    if (!chat) {
      throw new AppError('Chat not found', 404);
    }

    // Add user message
    chat.addMessage({
      role: role as 'user' | 'assistant' | 'system',
      content
    });

    // If it's a user message, generate AI response
    let aiResponse = null;
    if (role === 'user') {
      try {
        // Prepare messages for AI
        const messages: ChatMessage[] = chat.messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));

        // Get AI response
        const result = await getChatCompletion(messages, {
          userId: userId.toString()
        });

        // Add AI response to chat
        chat.addMessage({
          role: 'assistant',
          content: result.content,
          metadata: {
            model: result.model,
            tokens: result.tokensUsed,
            cost: result.cost,
            processingTime: result.processingTime
          }
        });

        aiResponse = {
          content: result.content,
          metadata: {
            model: result.model,
            tokens: result.tokensUsed,
            cost: result.cost,
            processingTime: result.processingTime
          }
        };

        // Update user token usage
        const user = await User.findById(userId);
        if (user) {
          user.usage.aiTokensUsed += result.tokensUsed;
          await user.save();
        }

      } catch (error: any) {
        logger.error('AI response generation failed:', error);
        
        // Add error message to chat
        chat.addMessage({
          role: 'assistant',
          content: 'Sorry, I encountered an error while processing your message. Please try again.',
          metadata: {
            error: error.message
          }
        });
      }
    }

    await chat.save();

    // Emit real-time updates
    emitToUser(io, userId.toString(), 'chat_message_added', {
      chatId: chat._id,
      message: chat.messages[chat.messages.length - 1]
    });

    if (aiResponse) {
      emitToUser(io, userId.toString(), 'ai_response_received', {
        chatId: chat._id,
        response: aiResponse
      });
    }

    res.status(201).json({
      status: 'success',
      data: {
        message: chat.messages[chat.messages.length - (aiResponse ? 2 : 1)],
        aiResponse
      }
    });
  })
);

// Stream AI response
router.post('/:id/stream', 
  sendMessageValidation,
  checkUsageLimit('aiTokens'),
  catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!._id;
    const { content } = req.body;

    const chat = await Chat.findOne({ _id: id, userId });
    
    if (!chat) {
      throw new AppError('Chat not found', 404);
    }

    // Add user message
    chat.addMessage({
      role: 'user',
      content
    });

    // Prepare messages for AI
    const messages: ChatMessage[] = chat.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    try {
      // Set up streaming response
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Get streaming response
      const stream = await getChatCompletionStream(messages, {
        userId: userId.toString()
      });

      const reader = stream.getReader();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        fullResponse += chunk;
        res.write(chunk);

        // Emit real-time chunk
        emitToUser(io, userId.toString(), 'ai_stream_chunk', {
          chatId: chat._id,
          chunk
        });
      }

      // Add complete AI response to chat
      chat.addMessage({
        role: 'assistant',
        content: fullResponse
      });

      await chat.save();

      res.end();

    } catch (error: any) {
      logger.error('Streaming AI response failed:', error);
      res.status(500).write('Error generating response');
      res.end();
    }
  })
);

// Update chat
router.patch('/:id', updateChatValidation, catchAsync(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400);
  }

  const { id } = req.params;
  const userId = req.user!._id;
  const updates = req.body;

  const chat = await Chat.findOneAndUpdate(
    { _id: id, userId },
    updates,
    { new: true, runValidators: true }
  );

  if (!chat) {
    throw new AppError('Chat not found', 404);
  }

  res.json({
    status: 'success',
    data: { chat }
  });
}));

// Delete chat
router.delete('/:id', catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!._id;

  const chat = await Chat.findOneAndDelete({ _id: id, userId });

  if (!chat) {
    throw new AppError('Chat not found', 404);
  }

  res.json({
    status: 'success',
    message: 'Chat deleted successfully'
  });
}));

// Get chat messages with pagination
router.get('/:id/messages', catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!._id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;

  const chat = await Chat.findOne({ _id: id, userId });
  
  if (!chat) {
    throw new AppError('Chat not found', 404);
  }

  const skip = (page - 1) * limit;
  const messages = chat.messages.slice(skip, skip + limit);

  res.json({
    status: 'success',
    data: {
      messages,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(chat.messages.length / limit),
        totalItems: chat.messages.length,
        itemsPerPage: limit
      }
    }
  });
}));

// Archive/unarchive chat
router.patch('/:id/archive', catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!._id;
  const { isActive = false } = req.body;

  const chat = await Chat.findOneAndUpdate(
    { _id: id, userId },
    { isActive },
    { new: true }
  );

  if (!chat) {
    throw new AppError('Chat not found', 404);
  }

  res.json({
    status: 'success',
    message: `Chat ${isActive ? 'unarchived' : 'archived'} successfully`,
    data: { chat }
  });
}));

// Get chat statistics
router.get('/:id/stats', catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!._id;

  const chat = await Chat.findOne({ _id: id, userId });
  
  if (!chat) {
    throw new AppError('Chat not found', 404);
  }

  const userMessages = chat.messages.filter(msg => msg.role === 'user').length;
  const assistantMessages = chat.messages.filter(msg => msg.role === 'assistant').length;
  const systemMessages = chat.messages.filter(msg => msg.role === 'system').length;

  const stats = {
    totalMessages: chat.messages.length,
    userMessages,
    assistantMessages,
    systemMessages,
    totalTokens: chat.totalTokens,
    totalCost: chat.totalCost,
    averageResponseTime: chat.messages
      .filter(msg => msg.metadata?.processingTime)
      .reduce((acc, msg) => acc + (msg.metadata?.processingTime || 0), 0) / assistantMessages || 0,
    createdAt: chat.createdAt,
    lastMessageAt: chat.lastMessageAt
  };

  res.json({
    status: 'success',
    data: { stats }
  });
}));

// Export chat
router.get('/:id/export', catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!._id;
  const format = req.query.format as string || 'json';

  const chat = await Chat.findOne({ _id: id, userId }).populate('userId', 'username email');
  
  if (!chat) {
    throw new AppError('Chat not found', 404);
  }

  if (format === 'json') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="chat-${chat._id}.json"`);
    res.json(chat);
  } else if (format === 'txt') {
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="chat-${chat._id}.txt"`);
    
    let content = `Chat: ${chat.title}\n`;
    content += `Created: ${chat.createdAt}\n`;
    content += `Messages: ${chat.messages.length}\n\n`;
    
    chat.messages.forEach((msg, index) => {
      content += `[${index + 1}] ${msg.role.toUpperCase()}: ${msg.content}\n\n`;
    });
    
    res.send(content);
  } else {
    throw new AppError('Unsupported export format', 400);
  }
}));

// Duplicate chat
router.post('/:id/duplicate', catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!._id;

  const originalChat = await Chat.findOne({ _id: id, userId });
  
  if (!originalChat) {
    throw new AppError('Chat not found', 404);
  }

  const duplicatedChat = new Chat({
    userId,
    title: `${originalChat.title} (Copy)`,
    messages: originalChat.messages,
    tags: originalChat.tags,
    isActive: true
  });

  await duplicatedChat.save();

  res.status(201).json({
    status: 'success',
    data: { chat: duplicatedChat }
  });
}));

export default router;