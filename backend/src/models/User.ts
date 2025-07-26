import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '../types';
import { config } from '../config/environment';

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  firstName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  avatar: {
    type: String,
  },
  plan: {
    type: String,
    enum: ['free', 'pro', 'enterprise'],
    default: 'free',
  },
  credits: {
    type: Number,
    default: function() {
      return config.planLimits.free.monthlyCredits;
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLoginAt: {
    type: Date,
  },
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete (ret as any).password;
      return ret;
    }
  }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ plan: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const saltRounds = config.bcrypt.rounds;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.firstName || this.lastName || this.email.split('@')[0];
});

// Static method to find by email
userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

// Instance method to check plan limits
userSchema.methods.canPerformAction = function(action: string): boolean {
  const limits = config.planLimits[this.plan as keyof typeof config.planLimits];
  
  switch (action) {
    case 'ai_request':
      return this.credits > 0;
    case 'advanced_features':
      return limits.advancedFeatures;
    default:
      return true;
  }
};

// Instance method to deduct credits
userSchema.methods.deductCredits = async function(amount: number): Promise<boolean> {
  if (this.credits >= amount) {
    this.credits -= amount;
    await this.save();
    return true;
  }
  return false;
};

export const User = mongoose.model<IUser>('User', userSchema);