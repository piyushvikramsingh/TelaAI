import { Router } from 'express';
import { ChatController } from '../controllers/chatController';
import { authenticateToken, checkCredits } from '../middleware/auth';
import { 
  validateChatMessage, 
  validateConversationId, 
  validatePagination 
} from '../middleware/validation';

const router = Router();

// All chat routes require authentication
router.use(authenticateToken);

// Send message (requires credits)
router.post('/message', checkCredits(1), validateChatMessage, ChatController.sendMessage);

// Get conversations
router.get('/conversations', validatePagination, ChatController.getConversations);

// Get specific conversation
router.get('/conversations/:conversationId', validateConversationId, ChatController.getConversation);

// Update conversation
router.put('/conversations/:conversationId', validateConversationId, ChatController.updateConversation);

// Delete conversation
router.delete('/conversations/:conversationId', validateConversationId, ChatController.deleteConversation);

// Get chat statistics
router.get('/stats', ChatController.getStats);

export default router;