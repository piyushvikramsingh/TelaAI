"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const environment_1 = require("../config/environment");
const userSchema = new mongoose_1.Schema({
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
        default: function () {
            return environment_1.config.planLimits.free.monthlyCredits;
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
        transform: function (doc, ret) {
            delete ret.password;
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
userSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    try {
        const saltRounds = environment_1.config.bcrypt.rounds;
        this.password = await bcryptjs_1.default.hash(this.password, saltRounds);
        next();
    }
    catch (error) {
        next(error);
    }
});
// Instance method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcryptjs_1.default.compare(candidatePassword, this.password);
};
// Virtual for full name
userSchema.virtual('fullName').get(function () {
    if (this.firstName && this.lastName) {
        return `${this.firstName} ${this.lastName}`;
    }
    return this.firstName || this.lastName || this.email.split('@')[0];
});
// Static method to find by email
userSchema.statics.findByEmail = function (email) {
    return this.findOne({ email: email.toLowerCase() });
};
// Instance method to check plan limits
userSchema.methods.canPerformAction = function (action) {
    const limits = environment_1.config.planLimits[this.plan];
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
userSchema.methods.deductCredits = async function (amount) {
    if (this.credits >= amount) {
        this.credits -= amount;
        await this.save();
        return true;
    }
    return false;
};
exports.User = mongoose_1.default.model('User', userSchema);
//# sourceMappingURL=User.js.map