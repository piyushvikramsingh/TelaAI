import { Schema, model, Document, Types } from 'mongoose';

export interface IDesignAsset {
  id: string;
  type: 'image' | 'icon' | 'logo' | 'layout' | 'component' | 'color_palette' | 'typography';
  url?: string;
  data: any;
  metadata: {
    dimensions?: { width: number; height: number };
    format?: string;
    size?: number;
    colors?: string[];
  };
  createdAt: Date;
}

export interface IDesign extends Document {
  userId: Types.ObjectId;
  title: string;
  description?: string;
  type: 'logo' | 'banner' | 'poster' | 'web_design' | 'app_design' | 'brand_identity' | 'presentation' | 'custom';
  status: 'draft' | 'generating' | 'completed' | 'failed';
  prompt: string;
  style?: string;
  colors: string[];
  assets: IDesignAsset[];
  tags: string[];
  isPublic: boolean;
  shareToken?: string;
  likes: number;
  views: number;
  aiModel?: string;
  generationParams: {
    style?: string;
    aspectRatio?: string;
    quality?: string;
    iterations?: number;
    seed?: number;
  };
  metadata: {
    processingTime?: number;
    cost?: number;
    version?: number;
    thumbnail?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  addAsset(asset: Omit<IDesignAsset, 'id' | 'createdAt'>): string;
  removeAsset(assetId: string): void;
  generateShareToken(): string;
  incrementViews(): void;
  incrementLikes(): void;
}

const designAssetSchema = new Schema<IDesignAsset>({
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['image', 'icon', 'logo', 'layout', 'component', 'color_palette', 'typography'],
    required: true
  },
  url: String,
  data: {
    type: Schema.Types.Mixed,
    required: true
  },
  metadata: {
    dimensions: {
      width: Number,
      height: Number
    },
    format: String,
    size: Number,
    colors: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const designSchema = new Schema<IDesign>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: [200, 'Design title cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Design description cannot exceed 1000 characters']
  },
  type: {
    type: String,
    enum: ['logo', 'banner', 'poster', 'web_design', 'app_design', 'brand_identity', 'presentation', 'custom'],
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'generating', 'completed', 'failed'],
    default: 'draft'
  },
  prompt: {
    type: String,
    required: true,
    maxlength: [2000, 'Design prompt cannot exceed 2000 characters']
  },
  style: String,
  colors: [{
    type: String,
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format']
  }],
  assets: [designAssetSchema],
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  shareToken: String,
  likes: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  aiModel: String,
  generationParams: {
    style: String,
    aspectRatio: String,
    quality: String,
    iterations: Number,
    seed: Number
  },
  metadata: {
    processingTime: Number,
    cost: Number,
    version: {
      type: Number,
      default: 1
    },
    thumbnail: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
designSchema.index({ userId: 1, createdAt: -1 });
designSchema.index({ userId: 1, type: 1 });
designSchema.index({ userId: 1, status: 1 });
designSchema.index({ isPublic: 1, likes: -1 });
designSchema.index({ tags: 1 });
designSchema.index({ shareToken: 1 });

// Virtual for asset count
designSchema.virtual('assetCount').get(function() {
  return this.assets.length;
});

// Virtual for primary asset
designSchema.virtual('primaryAsset').get(function() {
  return this.assets.length > 0 ? this.assets[0] : null;
});

// Virtual for engagement score
designSchema.virtual('engagementScore').get(function() {
  return this.likes + (this.views * 0.1);
});

// Pre-save middleware
designSchema.pre('save', function(next) {
  // Generate thumbnail from primary asset
  if (this.isModified('assets') && this.assets.length > 0) {
    const primaryAsset = this.assets[0];
    if (primaryAsset.url) {
      this.metadata.thumbnail = primaryAsset.url;
    }
  }
  
  // Update version on significant changes
  if (this.isModified('assets') || this.isModified('colors') || this.isModified('prompt')) {
    this.metadata.version = (this.metadata.version || 1) + 1;
  }
  
  next();
});

// Instance method to add asset
designSchema.methods.addAsset = function(asset: Omit<IDesignAsset, 'id' | 'createdAt'>): string {
  const id = new Types.ObjectId().toString();
  this.assets.push({
    ...asset,
    id,
    createdAt: new Date()
  });
  return id;
};

// Instance method to remove asset
designSchema.methods.removeAsset = function(assetId: string): void {
  this.assets = this.assets.filter(asset => asset.id !== assetId);
};

// Instance method to generate share token
designSchema.methods.generateShareToken = function(): string {
  const crypto = require('crypto');
  this.shareToken = crypto.randomBytes(32).toString('hex');
  return this.shareToken;
};

// Instance method to increment views
designSchema.methods.incrementViews = function(): void {
  this.views += 1;
};

// Instance method to increment likes
designSchema.methods.incrementLikes = function(): void {
  this.likes += 1;
};

export const Design = model<IDesign>('Design', designSchema);