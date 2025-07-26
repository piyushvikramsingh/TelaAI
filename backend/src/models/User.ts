import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: 'user' | 'admin' | 'premium';
  isVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  refreshTokens: string[];
  preferences: {
    theme: 'dark' | 'light';
    language: string;
    notifications: {
      email: boolean;
      push: boolean;
      aiUpdates: boolean;
    };
  };
  subscription: {
    plan: 'free' | 'pro' | 'enterprise';
    status: 'active' | 'inactive' | 'cancelled';
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
    customerId?: string;
  };
  usage: {
    aiTokensUsed: number;
    aiTokensLimit: number;
    filesUploaded: number;
    filesLimit: number;
    tasksCreated: number;
    tasksLimit: number;
  };
  lastLogin?: Date;
  lastActive?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateRefreshToken(): string;
  removeRefreshToken(token: string): void;
  isTokenLimitExceeded(): boolean;
  resetUsageCounters(): void;
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't include password in queries by default
  },
  firstName: {
    type: String,
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  avatar: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'premium'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  refreshTokens: [{
    type: String
  }],
  preferences: {
    theme: {
      type: String,
      enum: ['dark', 'light'],
      default: 'dark'
    },
    language: {
      type: String,
      default: 'en'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      aiUpdates: {
        type: Boolean,
        default: true
      }
    }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled'],
      default: 'active'
    },
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    customerId: String
  },
  usage: {
    aiTokensUsed: {
      type: Number,
      default: 0
    },
    aiTokensLimit: {
      type: Number,
      default: 10000 // Free tier limit
    },
    filesUploaded: {
      type: Number,
      default: 0
    },
    filesLimit: {
      type: Number,
      default: 10 // Free tier limit
    },
    tasksCreated: {
      type: Number,
      default: 0
    },
    tasksLimit: {
      type: Number,
      default: 50 // Free tier limit
    }
  },
  lastLogin: Date,
  lastActive: Date
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.refreshTokens;
      delete ret.verificationToken;
      delete ret.resetPasswordToken;
      return ret;
    }
  }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ verificationToken: 1 });
userSchema.index({ resetPasswordToken: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error as any);
  }
});

// Pre-save middleware to update lastActive
userSchema.pre('save', function(next) {
  this.lastActive = new Date();
  next();
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

// Instance method to generate refresh token
userSchema.methods.generateRefreshToken = function(): string {
  const crypto = require('crypto');
  const token = crypto.randomBytes(40).toString('hex');
  this.refreshTokens.push(token);
  return token;
};

// Instance method to remove refresh token
userSchema.methods.removeRefreshToken = function(token: string): void {
  this.refreshTokens = this.refreshTokens.filter((t: string) => t !== token);
};

// Instance method to check token usage limits
userSchema.methods.isTokenLimitExceeded = function(): boolean {
  return this.usage.aiTokensUsed >= this.usage.aiTokensLimit;
};

// Instance method to reset usage counters (called monthly)
userSchema.methods.resetUsageCounters = function(): void {
  this.usage.aiTokensUsed = 0;
  this.usage.filesUploaded = 0;
  this.usage.tasksCreated = 0;
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim() || this.username;
});

// Virtual for subscription status
userSchema.virtual('isSubscriptionActive').get(function() {
  return this.subscription.status === 'active' && 
         (!this.subscription.currentPeriodEnd || this.subscription.currentPeriodEnd > new Date());
});

export const User = model<IUser>('User', userSchema);