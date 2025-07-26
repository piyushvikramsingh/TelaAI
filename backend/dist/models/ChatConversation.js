"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatConversation = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const messageSchema = new mongoose_1.Schema({
    role: {
        type: String,
        enum: ['user', 'assistant', 'system'],
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    tokenCount: {
        type: Number,
    },
    model: {
        type: String,
    },
}, { _id: true });
const chatConversationSchema = new mongoose_1.Schema({
    userId: {
        type: String,
        required: true,
        index: true,
    },
    title: {
        type: String,
        required: true,
        default: 'New Conversation',
    },
    messages: [messageSchema],
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});
// Indexes
chatConversationSchema.index({ userId: 1, createdAt: -1 });
chatConversationSchema.index({ userId: 1, isActive: 1 });
chatConversationSchema.index({ 'messages.timestamp': -1 });
// Virtual for message count
chatConversationSchema.virtual('messageCount').get(function () {
    return this.messages.length;
});
// Virtual for last message
chatConversationSchema.virtual('lastMessage').get(function () {
    return this.messages.length > 0 ? this.messages[this.messages.length - 1] : null;
});
// Instance method to add message
chatConversationSchema.methods.addMessage = function (message) {
    this.messages.push({
        ...message,
        timestamp: new Date(),
    });
    // Auto-generate title from first user message if still default
    if (this.title === 'New Conversation' && message.role === 'user' && this.messages.length <= 2) {
        const title = message.content.slice(0, 50);
        this.title = title.length < message.content.length ? `${title}...` : title;
    }
    return this.save();
};
// Instance method to get conversation summary
chatConversationSchema.methods.getSummary = function () {
    const messageCount = this.messages.length;
    const lastMessage = this.lastMessage;
    return {
        id: this._id,
        title: this.title,
        messageCount,
        lastMessage: lastMessage ? {
            role: lastMessage.role,
            content: lastMessage.content.slice(0, 100),
            timestamp: lastMessage.timestamp,
        } : null,
        updatedAt: this.updatedAt,
    };
};
// Static method to get user conversations with pagination
chatConversationSchema.statics.getUserConversations = function (userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return this.find({ userId, isActive: true })
        .select('title messages.role messages.timestamp createdAt updatedAt')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit);
};
// Static method to get conversation stats for user
chatConversationSchema.statics.getUserStats = async function (userId) {
    const stats = await this.aggregate([
        { $match: { userId, isActive: true } },
        {
            $group: {
                _id: null,
                totalConversations: { $sum: 1 },
                totalMessages: { $sum: { $size: '$messages' } },
                averageMessagesPerConversation: { $avg: { $size: '$messages' } },
            }
        }
    ]);
    return stats[0] || {
        totalConversations: 0,
        totalMessages: 0,
        averageMessagesPerConversation: 0,
    };
};
exports.ChatConversation = mongoose_1.default.model('ChatConversation', chatConversationSchema);
//# sourceMappingURL=ChatConversation.js.map