import mongoose, { Schema } from 'mongoose';
import { IChatConversation, IChatMessage } from '../types';

const messageSchema = new Schema<IChatMessage>({
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

const chatConversationSchema = new Schema<IChatConversation>({
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
chatConversationSchema.virtual('messageCount').get(function() {
  return this.messages.length;
});

// Virtual for last message
chatConversationSchema.virtual('lastMessage').get(function() {
  return this.messages.length > 0 ? this.messages[this.messages.length - 1] : null;
});

// Instance method to add message
chatConversationSchema.methods.addMessage = function(message: Omit<IChatMessage, '_id' | 'timestamp'>) {
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
chatConversationSchema.methods.getSummary = function() {
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
chatConversationSchema.statics.getUserConversations = function(
  userId: string, 
  page: number = 1, 
  limit: number = 20
) {
  const skip = (page - 1) * limit;
  
  return this.find({ userId, isActive: true })
    .select('title messages.role messages.timestamp createdAt updatedAt')
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get conversation stats for user
chatConversationSchema.statics.getUserStats = async function(userId: string) {
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

// Define the model with static methods
interface IChatConversationModel extends mongoose.Model<IChatConversation> {
  getUserConversations(userId: string, page?: number, limit?: number): Promise<IChatConversation[]>;
  getUserStats(userId: string): Promise<any>;
}

export const ChatConversation = mongoose.model<IChatConversation, IChatConversationModel>('ChatConversation', chatConversationSchema);