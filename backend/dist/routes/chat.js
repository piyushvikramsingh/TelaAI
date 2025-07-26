"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chatController_1 = require("../controllers/chatController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
// All chat routes require authentication
router.use(auth_1.authenticateToken);
// Send message (requires credits)
router.post('/message', (0, auth_1.checkCredits)(1), validation_1.validateChatMessage, chatController_1.ChatController.sendMessage);
// Get conversations
router.get('/conversations', validation_1.validatePagination, chatController_1.ChatController.getConversations);
// Get specific conversation
router.get('/conversations/:conversationId', validation_1.validateConversationId, chatController_1.ChatController.getConversation);
// Update conversation
router.put('/conversations/:conversationId', validation_1.validateConversationId, chatController_1.ChatController.updateConversation);
// Delete conversation
router.delete('/conversations/:conversationId', validation_1.validateConversationId, chatController_1.ChatController.deleteConversation);
// Get chat statistics
router.get('/stats', chatController_1.ChatController.getStats);
exports.default = router;
//# sourceMappingURL=chat.js.map