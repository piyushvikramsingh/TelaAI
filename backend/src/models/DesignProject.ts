import mongoose, { Schema } from 'mongoose';
import { IDesignProject, IDesignContent } from '../types';

const designContentSchema = new Schema<IDesignContent>({
  type: {
    type: String,
    enum: ['image', 'code', 'text'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  url: {
    type: String,
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {},
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, { _id: true });

const designProjectSchema = new Schema<IDesignProject>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  type: {
    type: String,
    enum: ['ui', 'logo', 'banner', 'illustration', 'other'],
    default: 'other',
  },
  prompt: {
    type: String,
    required: true,
  },
  generatedContent: [designContentSchema],
  status: {
    type: String,
    enum: ['generating', 'completed', 'failed'],
    default: 'generating',
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

// Indexes
designProjectSchema.index({ userId: 1, status: 1 });
designProjectSchema.index({ userId: 1, type: 1 });
designProjectSchema.index({ userId: 1, createdAt: -1 });
designProjectSchema.index({ status: 1 });

// Virtual for content count
designProjectSchema.virtual('contentCount').get(function() {
  return this.generatedContent.length;
});

// Virtual for latest content
designProjectSchema.virtual('latestContent').get(function() {
  return this.generatedContent.length > 0 
    ? this.generatedContent[this.generatedContent.length - 1] 
    : null;
});

// Virtual for generation duration (if completed)
designProjectSchema.virtual('generationDuration').get(function() {
  if (this.status !== 'completed') return null;
  return this.updatedAt.getTime() - this.createdAt.getTime();
});

// Instance method to add generated content
designProjectSchema.methods.addContent = function(content: Omit<IDesignContent, '_id' | 'timestamp'>) {
  this.generatedContent.push({
    ...content,
    timestamp: new Date(),
  });
  return this.save();
};

// Instance method to mark as completed
designProjectSchema.methods.markCompleted = function() {
  this.status = 'completed';
  return this.save();
};

// Instance method to mark as failed
designProjectSchema.methods.markFailed = function(errorMessage?: string) {
  this.status = 'failed';
  if (errorMessage) {
    this.metadata = { ...this.metadata, error: errorMessage };
  }
  return this.save();
};

// Instance method to get project summary
designProjectSchema.methods.getSummary = function() {
  return {
    id: this._id,
    name: this.name,
    type: this.type,
    status: this.status,
    contentCount: this.contentCount,
    latestContent: this.latestContent ? {
      type: this.latestContent.type,
      timestamp: this.latestContent.timestamp,
    } : null,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Static method to get user projects with filters
designProjectSchema.statics.getUserProjects = function(
  userId: string,
  filters: {
    status?: string[];
    type?: string[];
    search?: string;
  } = {},
  page: number = 1,
  limit: number = 20
) {
  const query: any = { userId };
  
  if (filters.status?.length) {
    query.status = { $in: filters.status };
  }
  
  if (filters.type?.length) {
    query.type = { $in: filters.type };
  }
  
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
      { prompt: { $regex: filters.search, $options: 'i' } },
    ];
  }
  
  const skip = (page - 1) * limit;
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get project statistics
designProjectSchema.statics.getUserProjectStats = async function(userId: string) {
  const stats = await this.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const statusCounts = stats.reduce((acc, stat) => {
    acc[stat._id] = stat.count;
    return acc;
  }, {});
  
  // Get type breakdown
  const typeStats = await this.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const typeCounts = typeStats.reduce((acc, stat) => {
    acc[stat._id] = stat.count;
    return acc;
  }, {});
  
  // Get content statistics
  const contentStats = await this.aggregate([
    { $match: { userId } },
    {
      $project: {
        contentCount: { $size: '$generatedContent' }
      }
    },
    {
      $group: {
        _id: null,
        totalContent: { $sum: '$contentCount' },
        avgContentPerProject: { $avg: '$contentCount' }
      }
    }
  ]);
  
  const total = Object.values(statusCounts).reduce((sum: number, count) => sum + (count as number), 0);
  
  return {
    total,
    byStatus: statusCounts,
    byType: typeCounts,
    totalContent: contentStats[0]?.totalContent || 0,
    avgContentPerProject: Math.round((contentStats[0]?.avgContentPerProject || 0) * 10) / 10,
  };
};

// Static method to get recent projects
designProjectSchema.statics.getRecentProjects = function(userId: string, days: number = 7, limit: number = 10) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return this.find({
    userId,
    createdAt: { $gte: cutoffDate }
  })
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Static method to get projects by type
designProjectSchema.statics.getProjectsByType = function(userId: string, type: string, limit: number = 20) {
  return this.find({ userId, type })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to search projects
designProjectSchema.statics.searchProjects = function(userId: string, searchTerm: string, limit: number = 20) {
  return this.find({
    userId,
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { prompt: { $regex: searchTerm, $options: 'i' } },
    ]
  })
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Static method to get failed projects for retry
designProjectSchema.statics.getFailedProjects = function(userId: string) {
  return this.find({ userId, status: 'failed' })
    .sort({ createdAt: -1 });
};

// Static method to cleanup old generating projects (potential stuck projects)
designProjectSchema.statics.cleanupStuckProjects = async function(hoursOld: number = 24) {
  const cutoffDate = new Date();
  cutoffDate.setHours(cutoffDate.getHours() - hoursOld);
  
  const result = await this.updateMany(
    {
      status: 'generating',
      createdAt: { $lt: cutoffDate }
    },
    {
      $set: {
        status: 'failed',
        'metadata.error': 'Generation timeout - project was stuck in generating state'
      }
    }
  );
  
  return result.modifiedCount;
};

export const DesignProject = mongoose.model<IDesignProject>('DesignProject', designProjectSchema);