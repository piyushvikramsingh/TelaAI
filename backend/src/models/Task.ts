import mongoose, { Schema } from 'mongoose';
import { ITask } from '../types';

const taskSchema = new Schema<ITask>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    enum: ['coding', 'design', 'analysis', 'writing', 'other'],
    default: 'other',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending',
  },
  dueDate: {
    type: Date,
  },
  aiGenerated: {
    type: Boolean,
    default: false,
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

// Indexes
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, category: 1 });
taskSchema.index({ userId: 1, priority: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ userId: 1, createdAt: -1 });
taskSchema.index({ dueDate: 1, status: 1 }); // for overdue tasks

// Virtual for overdue status
taskSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate || this.status === 'completed' || this.status === 'cancelled') {
    return false;
  }
  return this.dueDate < new Date();
});

// Virtual for days until due
taskSchema.virtual('daysUntilDue').get(function() {
  if (!this.dueDate) return null;
  const now = new Date();
  const diffTime = this.dueDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Instance method to mark as completed
taskSchema.methods.markCompleted = function() {
  this.status = 'completed';
  return this.save();
};

// Instance method to update priority
taskSchema.methods.updatePriority = function(priority: string) {
  if (['low', 'medium', 'high', 'urgent'].includes(priority)) {
    this.priority = priority;
    return this.save();
  }
  throw new Error('Invalid priority value');
};

// Static method to get user tasks with filters
taskSchema.statics.getUserTasks = function(
  userId: string,
  filters: {
    status?: string[];
    category?: string[];
    priority?: string[];
    overdue?: boolean;
  } = {},
  page: number = 1,
  limit: number = 20
) {
  const query: any = { userId };
  
  if (filters.status?.length) {
    query.status = { $in: filters.status };
  }
  
  if (filters.category?.length) {
    query.category = { $in: filters.category };
  }
  
  if (filters.priority?.length) {
    query.priority = { $in: filters.priority };
  }
  
  if (filters.overdue) {
    query.dueDate = { $lt: new Date() };
    query.status = { $nin: ['completed', 'cancelled'] };
  }
  
  const skip = (page - 1) * limit;
  
  return this.find(query)
    .sort({ priority: -1, dueDate: 1, createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get task statistics
taskSchema.statics.getUserTaskStats = async function(userId: string) {
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
  
  // Get overdue count
  const overdueCount = await this.countDocuments({
    userId,
    dueDate: { $lt: new Date() },
    status: { $nin: ['completed', 'cancelled'] }
  });
  
  // Get category breakdown
  const categoryStats = await this.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const categoryCounts = categoryStats.reduce((acc, stat) => {
    acc[stat._id] = stat.count;
    return acc;
  }, {});
  
  return {
    total: Object.values(statusCounts).reduce((sum: number, count) => sum + (count as number), 0),
    byStatus: statusCounts,
    byCategory: categoryCounts,
    overdue: overdueCount,
  };
};

// Static method to get upcoming deadlines
taskSchema.statics.getUpcomingDeadlines = function(userId: string, days: number = 7) {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);
  
  return this.find({
    userId,
    dueDate: {
      $gte: new Date(),
      $lte: endDate
    },
    status: { $nin: ['completed', 'cancelled'] }
  }).sort({ dueDate: 1 });
};

// Define the model with static methods
interface ITaskModel extends mongoose.Model<ITask> {
  getUserTasks(userId: string, filters?: any, page?: number, limit?: number): Promise<ITask[]>;
  getUserTaskStats(userId: string): Promise<any>;
  getUpcomingDeadlines(userId: string, days?: number): Promise<ITask[]>;
}

export const Task = mongoose.model<ITask, ITaskModel>('Task', taskSchema);