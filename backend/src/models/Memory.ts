import { Schema, model, Document, Types } from 'mongoose';

export interface IMemory extends Document {
  userId: Types.ObjectId;
  title: string;
  content: string;
  type: 'note' | 'conversation' | 'knowledge' | 'context' | 'preference' | 'skill';
  tags: string[];
  category?: string;
  importance: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  embedding?: number[];
  relatedMemories: Types.ObjectId[];
  metadata: {
    source?: string;
    confidence?: number;
    lastAccessed?: Date;
    accessCount?: number;
    extractedEntities?: string[];
    summary?: string;
  };
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  addRelatedMemory(memoryId: Types.ObjectId): void;
  removeRelatedMemory(memoryId: Types.ObjectId): void;
  updateAccess(): void;
  generateSummary(): void;
}

const memorySchema = new Schema<IMemory>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: [200, 'Memory title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: true,
    maxlength: [10000, 'Memory content cannot exceed 10000 characters']
  },
  type: {
    type: String,
    enum: ['note', 'conversation', 'knowledge', 'context', 'preference', 'skill'],
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  category: {
    type: String,
    maxlength: 100
  },
  importance: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  embedding: [{
    type: Number
  }],
  relatedMemories: [{
    type: Schema.Types.ObjectId,
    ref: 'Memory'
  }],
  metadata: {
    source: String,
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 1
    },
    lastAccessed: Date,
    accessCount: {
      type: Number,
      default: 0
    },
    extractedEntities: [String],
    summary: String
  },
  expiresAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
memorySchema.index({ userId: 1, type: 1 });
memorySchema.index({ userId: 1, category: 1 });
memorySchema.index({ userId: 1, importance: -1 });
memorySchema.index({ userId: 1, isActive: 1 });
memorySchema.index({ tags: 1 });
memorySchema.index({ expiresAt: 1 });
memorySchema.index({ 'metadata.lastAccessed': -1 });

// Virtual for is expired
memorySchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < new Date();
});

// Virtual for content preview
memorySchema.virtual('preview').get(function() {
  return this.content.length > 100 ? this.content.substring(0, 100) + '...' : this.content;
});

// Pre-save middleware
memorySchema.pre('save', function(next) {
  // Generate summary if content is long
  if (this.isModified('content') && this.content.length > 200) {
    this.generateSummary();
  }
  
  // Update access metadata
  if (this.isModified('metadata.lastAccessed')) {
    this.metadata.accessCount = (this.metadata.accessCount || 0) + 1;
  }
  
  next();
});

// Instance method to add related memory
memorySchema.methods.addRelatedMemory = function(memoryId: Types.ObjectId): void {
  if (!this.relatedMemories.includes(memoryId)) {
    this.relatedMemories.push(memoryId);
  }
};

// Instance method to remove related memory
memorySchema.methods.removeRelatedMemory = function(memoryId: Types.ObjectId): void {
  this.relatedMemories = this.relatedMemories.filter(id => !id.equals(memoryId));
};

// Instance method to update access
memorySchema.methods.updateAccess = function(): void {
  this.metadata.lastAccessed = new Date();
  this.metadata.accessCount = (this.metadata.accessCount || 0) + 1;
};

// Instance method to generate summary
memorySchema.methods.generateSummary = function(): void {
  // Simple summary generation - first sentence or first 100 characters
  const sentences = this.content.split(/[.!?]+/);
  if (sentences.length > 1 && sentences[0].trim().length > 0) {
    this.metadata.summary = sentences[0].trim() + '.';
  } else {
    this.metadata.summary = this.content.substring(0, 100) + (this.content.length > 100 ? '...' : '');
  }
};

export const Memory = model<IMemory>('Memory', memorySchema);