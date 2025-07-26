import { Schema, model, Document, Types } from 'mongoose';

export interface IFile extends Document {
  userId: Types.ObjectId;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url?: string;
  type: 'document' | 'image' | 'audio' | 'video' | 'code' | 'data' | 'other';
  status: 'uploading' | 'processing' | 'ready' | 'failed';
  tags: string[];
  metadata: {
    extractedText?: string;
    summary?: string;
    analysis?: any;
    thumbnail?: string;
    duration?: number;
    dimensions?: {
      width: number;
      height: number;
    };
  };
  processedData?: any;
  isPublic: boolean;
  shareToken?: string;
  downloadCount: number;
  lastAccessedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  generateShareToken(): string;
  markAsProcessed(data?: any): void;
  markAsFailed(error: string): void;
  incrementDownloadCount(): void;
}

const fileSchema = new Schema<IFile>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true,
    maxlength: [255, 'Original filename cannot exceed 255 characters']
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true,
    min: [0, 'File size cannot be negative']
  },
  path: {
    type: String,
    required: true
  },
  url: String,
  type: {
    type: String,
    enum: ['document', 'image', 'audio', 'video', 'code', 'data', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['uploading', 'processing', 'ready', 'failed'],
    default: 'uploading'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  metadata: {
    extractedText: String,
    summary: String,
    analysis: Schema.Types.Mixed,
    thumbnail: String,
    duration: Number,
    dimensions: {
      width: Number,
      height: Number
    }
  },
  processedData: Schema.Types.Mixed,
  isPublic: {
    type: Boolean,
    default: false
  },
  shareToken: String,
  downloadCount: {
    type: Number,
    default: 0
  },
  lastAccessedAt: Date,
  expiresAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
fileSchema.index({ userId: 1, createdAt: -1 });
fileSchema.index({ userId: 1, type: 1 });
fileSchema.index({ userId: 1, status: 1 });
fileSchema.index({ shareToken: 1 });
fileSchema.index({ expiresAt: 1 });

// Virtual for file extension
fileSchema.virtual('extension').get(function() {
  const parts = this.originalName.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
});

// Virtual for is expired
fileSchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < new Date();
});

// Virtual for formatted size
fileSchema.virtual('formattedSize').get(function() {
  const bytes = this.size;
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Pre-save middleware to determine file type
fileSchema.pre('save', function(next) {
  if (this.isModified('mimeType') || this.isModified('originalName')) {
    const mimeType = this.mimeType.toLowerCase();
    const extension = this.extension;
    
    if (mimeType.startsWith('image/')) {
      this.type = 'image';
    } else if (mimeType.startsWith('video/')) {
      this.type = 'video';
    } else if (mimeType.startsWith('audio/')) {
      this.type = 'audio';
    } else if (mimeType.includes('pdf') || 
               mimeType.includes('document') || 
               mimeType.includes('text') ||
               ['doc', 'docx', 'txt', 'rtf', 'odt'].includes(extension)) {
      this.type = 'document';
    } else if (['js', 'ts', 'py', 'java', 'cpp', 'c', 'html', 'css', 'json', 'xml'].includes(extension)) {
      this.type = 'code';
    } else if (['csv', 'xlsx', 'xls', 'json', 'xml'].includes(extension)) {
      this.type = 'data';
    } else {
      this.type = 'other';
    }
  }
  next();
});

// Instance method to generate share token
fileSchema.methods.generateShareToken = function(): string {
  const crypto = require('crypto');
  this.shareToken = crypto.randomBytes(32).toString('hex');
  return this.shareToken;
};

// Instance method to mark as processed
fileSchema.methods.markAsProcessed = function(data?: any): void {
  this.status = 'ready';
  if (data) {
    this.processedData = data;
  }
};

// Instance method to mark as failed
fileSchema.methods.markAsFailed = function(error: string): void {
  this.status = 'failed';
  this.metadata.analysis = { error };
};

// Instance method to increment download count
fileSchema.methods.incrementDownloadCount = function(): void {
  this.downloadCount += 1;
  this.lastAccessedAt = new Date();
};

export const File = model<IFile>('File', fileSchema);