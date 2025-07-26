"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const express_validator_1 = require("express-validator");
const ChatConversation_1 = require("../models/ChatConversation");
const MemoryEntry_1 = require("../models/MemoryEntry");
const openai_1 = require("../services/openai");
const logger_1 = require("../utils/logger");
class ChatController {
    /**
     * Send a message and get AI response
     */
    static async sendMessage(req, res) {
        try {
            // Check validation errors
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
            const { message, conversationId } = req.body;
            const userId = req.user._id;
            // Check user credits
            if (req.user.credits < 1) {
                res.status(402).json({
                    success: false,
                    message: 'Insufficient credits'
                });
                return;
            }
            // Find or create conversation
            let conversation;
            if (conversationId) {
                conversation = await ChatConversation_1.ChatConversation.findOne({
                    _id: conversationId,
                    userId
                });
                if (!conversation) {
                    res.status(404).json({
                        success: false,
                        message: 'Conversation not found'
                    });
                    return;
                }
            }
            else {
                conversation = new ChatConversation_1.ChatConversation({
                    userId,
                    title: 'New Conversation',
                    messages: []
                });
            }
            // Add user message
            await conversation.addMessage({
                role: 'user',
                content: message
            });
            // Get user's memory context for more personalized responses
            const recentMemories = await MemoryEntry_1.MemoryEntry.find({ userId })
                .sort({ importance: -1, updatedAt: -1 })
                .limit(5);
            // Prepare messages for OpenAI (including context from memory)
            const systemPrompt = `You are Tela.ai, an advanced AI assistant with neural interface capabilities. You are helpful, knowledgeable, and personalized.

${recentMemories.length > 0 ? `
User Context (from memory):
${recentMemories.map(memory => `${memory.key}: ${JSON.stringify(memory.value)}`).join('\n')}
` : ''}

Provide accurate, helpful responses while maintaining the futuristic, neural interface persona.`;
            const messages = [
                { role: 'system', content: systemPrompt },
                ...conversation.messages.slice(-10).map(msg => ({
                    role: msg.role,
                    content: msg.content
                }))
            ];
            // Get AI response
            const aiResponse = await openai_1.OpenAIService.getChatCompletion(messages);
            // Add AI response to conversation
            await conversation.addMessage({
                role: 'assistant',
                content: aiResponse,
                model: 'gpt-4o-mini'
            });
            // Deduct credits
            await req.user.deductCredits(1);
            // Extract memory from the conversation if it contains important information
            this.extractAndStoreMemory(userId, message, aiResponse);
            logger_1.logger.info('Chat message processed', {
                userId,
                conversationId: conversation._id,
                messageLength: message.length
            });
            res.status(200).json({
                success: true,
                data: {
                    conversation: {
                        id: conversation._id,
                        title: conversation.title,
                        lastMessage: {
                            role: 'assistant',
                            content: aiResponse,
                            timestamp: new Date()
                        }
                    },
                    message: {
                        role: 'assistant',
                        content: aiResponse,
                        timestamp: new Date()
                    },
                    creditsRemaining: req.user.credits - 1
                },
                message: 'Message sent successfully'
            });
        }
        catch (error) {
            logger_1.logger.error('Send message failed', { error });
            res.status(500).json({
                success: false,
                message: 'Failed to send message'
            });
        }
    }
    /**
     * Get user conversations
     */
    static async getConversations(req, res) {
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
            const conversations = await ChatConversation_1.ChatConversation.getUserConversations(userId, page, limit);
            const total = await ChatConversation_1.ChatConversation.countDocuments({ userId, isActive: true });
            const conversationSummaries = conversations.map(conv => conv.getSummary());
            res.status(200).json({
                success: true,
                data: {
                    conversations: conversationSummaries,
                },
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Get conversations failed', { error });
            res.status(500).json({
                success: false,
                message: 'Failed to get conversations'
            });
        }
    }
    /**
     * Get specific conversation
     */
    static async getConversation(req, res) {
        try {
            // Check validation errors
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
            const { conversationId } = req.params;
            const userId = req.user._id;
            const conversation = await ChatConversation_1.ChatConversation.findOne({
                _id: conversationId,
                userId,
                isActive: true
            });
            if (!conversation) {
                res.status(404).json({
                    success: false,
                    message: 'Conversation not found'
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: {
                    conversation: {
                        id: conversation._id,
                        title: conversation.title,
                        messages: conversation.messages,
                        createdAt: conversation.createdAt,
                        updatedAt: conversation.updatedAt
                    }
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Get conversation failed', { error });
            res.status(500).json({
                success: false,
                message: 'Failed to get conversation'
            });
        }
    }
    /**
     * Update conversation title
     */
    static async updateConversation(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }
            const { conversationId } = req.params;
            const { title } = req.body;
            const userId = req.user._id;
            const conversation = await ChatConversation_1.ChatConversation.findOne({
                _id: conversationId,
                userId
            });
            if (!conversation) {
                res.status(404).json({
                    success: false,
                    message: 'Conversation not found'
                });
                return;
            }
            if (title) {
                conversation.title = title;
                await conversation.save();
            }
            res.status(200).json({
                success: true,
                data: {
                    conversation: conversation.getSummary()
                },
                message: 'Conversation updated successfully'
            });
        }
        catch (error) {
            logger_1.logger.error('Update conversation failed', { error });
            res.status(500).json({
                success: false,
                message: 'Failed to update conversation'
            });
        }
    }
    /**
     * Delete conversation
     */
    static async deleteConversation(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }
            const { conversationId } = req.params;
            const userId = req.user._id;
            const conversation = await ChatConversation_1.ChatConversation.findOne({
                _id: conversationId,
                userId
            });
            if (!conversation) {
                res.status(404).json({
                    success: false,
                    message: 'Conversation not found'
                });
                return;
            }
            conversation.isActive = false;
            await conversation.save();
            logger_1.logger.info('Conversation deleted', { userId, conversationId });
            res.status(200).json({
                success: true,
                message: 'Conversation deleted successfully'
            });
        }
        catch (error) {
            logger_1.logger.error('Delete conversation failed', { error });
            res.status(500).json({
                success: false,
                message: 'Failed to delete conversation'
            });
        }
    }
    /**
     * Get chat statistics
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
            const stats = await ChatConversation_1.ChatConversation.getUserStats(userId);
            res.status(200).json({
                success: true,
                data: {
                    stats
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Get chat stats failed', { error });
            res.status(500).json({
                success: false,
                message: 'Failed to get chat statistics'
            });
        }
    }
    /**
     * Extract and store important information from conversation
     */
    static async extractAndStoreMemory(userId, userMessage, aiResponse) {
        try {
            // Check if the conversation contains preference information
            const preferenceKeywords = ['prefer', 'like', 'dislike', 'favorite', 'hate', 'want', 'need'];
            const contextKeywords = ['working on', 'project', 'job', 'company', 'studying'];
            const skillKeywords = ['know', 'learn', 'good at', 'expert', 'skill', 'experience'];
            const content = `${userMessage} ${aiResponse}`.toLowerCase();
            let memoryType = 'note';
            if (preferenceKeywords.some(keyword => content.includes(keyword))) {
                memoryType = 'preference';
            }
            else if (contextKeywords.some(keyword => content.includes(keyword))) {
                memoryType = 'context';
            }
            else if (skillKeywords.some(keyword => content.includes(keyword))) {
                memoryType = 'skill';
            }
            // Extract memory using AI
            const memoryData = await openai_1.OpenAIService.extractMemoryKeyValue(`User: ${userMessage}\nAI: ${aiResponse}`, memoryType);
            if (memoryData) {
                // Check if similar memory already exists
                const existing = await MemoryEntry_1.MemoryEntry.findOne({
                    userId,
                    key: memoryData.key,
                    type: memoryType
                });
                if (existing) {
                    // Update existing memory
                    existing.value = memoryData.value;
                    existing.importance = Math.max(existing.importance, memoryData.importance);
                    existing.tags = [...new Set([...existing.tags, ...memoryData.tags])];
                    await existing.save();
                }
                else {
                    // Create new memory entry
                    const memory = new MemoryEntry_1.MemoryEntry({
                        userId,
                        type: memoryType,
                        key: memoryData.key,
                        value: memoryData.value,
                        importance: memoryData.importance,
                        tags: memoryData.tags
                    });
                    await memory.save();
                }
                logger_1.logger.info('Memory extracted and stored', {
                    userId,
                    memoryType,
                    key: memoryData.key
                });
            }
        }
        catch (error) {
            logger_1.logger.error('Failed to extract memory', { error });
            // Don't throw error - memory extraction is optional
        }
    }
}
exports.ChatController = ChatController;
//# sourceMappingURL=chatController.js.map