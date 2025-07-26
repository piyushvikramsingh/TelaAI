import { Schema, model, Document, Types } from 'mongoose';

export interface IMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    model?: string;
    tokens?: number;
    cost?: number;
    processingTime?: number;
  };
}

export interface IChat extends Document {
  userId: Types.ObjectId;
  title: string;
  messages: IMessage[];
  isActive: boolean;
  tags: string[];
  summary?: string;
  totalTokens: number;
  totalCost: number;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
  addMessage(message: Omit<IMessage, 'timestamp'>): void;
  generateSummary(): Promise<void>;
  calculateTotalTokens(): number;
  calculateTotalCost(): number;
}

const messageSchema = new Schema<IMessage>({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: [10000, 'Message content cannot exceed 10000 characters']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    model: String,
    tokens: Number,
    cost: Number,
    processingTime: Number
  }
}, { _id: false });

const chatSchema = new Schema<IChat>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: [200, 'Chat title cannot exceed 200 characters'],
    default: 'New Chat'
  },
  messages: [messageSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  summary: {
    type: String,
    maxlength: 500
  },
  totalTokens: {
    type: Number,
    default: 0
  },
  totalCost: {
    type: Number,
    default: 0
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
chatSchema.index({ userId: 1, createdAt: -1 });
chatSchema.index({ userId: 1, isActive: 1 });
chatSchema.index({ userId: 1, tags: 1 });
chatSchema.index({ lastMessageAt: -1 });

// Virtual for message count
chatSchema.virtual('messageCount').get(function() {
  return this.messages.length;
});

// Virtual for latest message
chatSchema.virtual('latestMessage').get(function() {
  return this.messages[this.messages.length - 1];
});

// Pre-save middleware to update lastMessageAt and totals
chatSchema.pre('save', function(next) {
  if (this.isModified('messages')) {
    if (this.messages.length > 0) {
      this.lastMessageAt = this.messages[this.messages.length - 1].timestamp;
    }
    this.totalTokens = this.calculateTotalTokens();
    this.totalCost = this.calculateTotalCost();
  }
  next();
});

// Instance method to add a message
chatSchema.methods.addMessage = function(message: Omit<IMessage, 'timestamp'>) {
  this.messages.push({
    ...message,
    timestamp: new Date()
  });
  this.lastMessageAt = new Date();
};

// Instance method to generate summary
chatSchema.methods.generateSummary = async function() {
  if (this.messages.length < 5) return;
  
  // Simple summary generation - in a real app, you'd use AI for this
  const userMessages = this.messages.filter(m => m.role === 'user');
  if (userMessages.length > 0) {
    const firstMessage = userMessages[0].content.substring(0, 100);
    this.summary = `Chat started with: "${firstMessage}${firstMessage.length >= 100 ? '...' : ''}"`;
  }
};

// Instance method to calculate total tokens
chatSchema.methods.calculateTotalTokens = function(): number {
  return this.messages.reduce((total, message) => {
    return total + (message.metadata?.tokens || 0);
  }, 0);
};

// Instance method to calculate total cost
chatSchema.methods.calculateTotalCost = function(): number {
  return this.messages.reduce((total, message) => {
    return total + (message.metadata?.cost || 0);
  }, 0);
};

export const Chat = model<IChat>('Chat', chatSchema);