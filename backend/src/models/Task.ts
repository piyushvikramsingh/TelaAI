import { Schema, model, Document, Types } from 'mongoose';

export interface ISubtask {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: any;
  createdAt: Date;
  completedAt?: Date;
}

export interface ITask extends Document {
  userId: Types.ObjectId;
  title: string;
  description?: string;
  type: 'chat' | 'code_generation' | 'data_analysis' | 'design' | 'file_processing' | 'custom';
  status: 'draft' | 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  input: any;
  output?: any;
  subtasks: ISubtask[];
  progress: number;
  estimatedDuration?: number;
  actualDuration?: number;
  aiModel?: string;
  tokensUsed?: number;
  cost?: number;
  error?: string;
  metadata: any;
  dueDate?: Date;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  addSubtask(subtask: Omit<ISubtask, 'id' | 'createdAt'>): string;
  updateSubtask(id: string, updates: Partial<ISubtask>): void;
  calculateProgress(): number;
  markCompleted(output?: any): void;
  markFailed(error: string): void;
}

const subtaskSchema = new Schema<ISubtask>({
  id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: [200, 'Subtask title cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Subtask description cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'failed'],
    default: 'pending'
  },
  result: Schema.Types.Mixed,
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date
}, { _id: false });

const taskSchema = new Schema<ITask>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: [200, 'Task title cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [2000, 'Task description cannot exceed 2000 characters']
  },
  type: {
    type: String,
    enum: ['chat', 'code_generation', 'data_analysis', 'design', 'file_processing', 'custom'],
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'in_progress', 'completed', 'failed', 'cancelled'],
    default: 'draft'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  input: {
    type: Schema.Types.Mixed,
    required: true
  },
  output: Schema.Types.Mixed,
  subtasks: [subtaskSchema],
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  estimatedDuration: Number, // in minutes
  actualDuration: Number, // in minutes
  aiModel: String,
  tokensUsed: {
    type: Number,
    default: 0
  },
  cost: {
    type: Number,
    default: 0
  },
  error: String,
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  dueDate: Date,
  startedAt: Date,
  completedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, type: 1 });
taskSchema.index({ userId: 1, createdAt: -1 });
taskSchema.index({ status: 1, priority: -1 });
taskSchema.index({ dueDate: 1 });

// Virtual for duration
taskSchema.virtual('duration').get(function() {
  if (this.startedAt && this.completedAt) {
    return Math.round((this.completedAt.getTime() - this.startedAt.getTime()) / 60000); // in minutes
  }
  return null;
});

// Virtual for is overdue
taskSchema.virtual('isOverdue').get(function() {
  return this.dueDate && this.dueDate < new Date() && this.status !== 'completed';
});

// Virtual for is urgent
taskSchema.virtual('isUrgent').get(function() {
  return this.priority === 'urgent' || this.isOverdue;
});

// Pre-save middleware
taskSchema.pre('save', function(next) {
  // Update progress based on subtasks
  if (this.isModified('subtasks')) {
    this.progress = this.calculateProgress();
  }
  
  // Set startedAt when status changes to in_progress
  if (this.isModified('status') && this.status === 'in_progress' && !this.startedAt) {
    this.startedAt = new Date();
  }
  
  // Set completedAt when status changes to completed
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
    this.progress = 100;
  }
  
  // Calculate actual duration
  if (this.startedAt && this.completedAt) {
    this.actualDuration = Math.round((this.completedAt.getTime() - this.startedAt.getTime()) / 60000);
  }
  
  next();
});

// Instance method to add subtask
taskSchema.methods.addSubtask = function(subtask: Omit<ISubtask, 'id' | 'createdAt'>): string {
  const id = new Types.ObjectId().toString();
  this.subtasks.push({
    ...subtask,
    id,
    createdAt: new Date()
  });
  return id;
};

// Instance method to update subtask
taskSchema.methods.updateSubtask = function(id: string, updates: Partial<ISubtask>): void {
  const subtask = this.subtasks.find((st: ISubtask) => st.id === id);
  if (subtask) {
    Object.assign(subtask, updates);
    if (updates.status === 'completed' && !subtask.completedAt) {
      subtask.completedAt = new Date();
    }
  }
};

// Instance method to calculate progress
taskSchema.methods.calculateProgress = function(): number {
  if (this.subtasks.length === 0) {
    return this.status === 'completed' ? 100 : 0;
  }
  
  const completedSubtasks = this.subtasks.filter((st: ISubtask) => st.status === 'completed').length;
  return Math.round((completedSubtasks / this.subtasks.length) * 100);
};

// Instance method to mark as completed
taskSchema.methods.markCompleted = function(output?: any): void {
  this.status = 'completed';
  this.completedAt = new Date();
  this.progress = 100;
  if (output !== undefined) {
    this.output = output;
  }
};

// Instance method to mark as failed
taskSchema.methods.markFailed = function(error: string): void {
  this.status = 'failed';
  this.error = error;
  this.completedAt = new Date();
};

export const Task = model<ITask>('Task', taskSchema);