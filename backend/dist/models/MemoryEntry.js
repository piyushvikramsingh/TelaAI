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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryEntry = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const memoryEntrySchema = new mongoose_1.Schema({
    userId: {
        type: String,
        required: true,
        index: true,
    },
    type: {
        type: String,
        enum: ['preference', 'context', 'skill', 'project', 'note'],
        required: true,
    },
    key: {
        type: String,
        required: true,
        trim: true,
    },
    value: {
        type: mongoose_1.Schema.Types.Mixed,
        required: true,
    },
    description: {
        type: String,
        trim: true,
    },
    importance: {
        type: Number,
        min: 1,
        max: 10,
        default: 5,
    },
    tags: [{
            type: String,
            trim: true,
            lowercase: true,
        }],
    expiresAt: {
        type: Date,
    },
}, {
    timestamps: true,
});
// Indexes
memoryEntrySchema.index({ userId: 1, type: 1 });
memoryEntrySchema.index({ userId: 1, key: 1 });
memoryEntrySchema.index({ userId: 1, importance: -1 });
memoryEntrySchema.index({ userId: 1, tags: 1 });
memoryEntrySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
memoryEntrySchema.index({ userId: 1, key: 1, type: 1 }, { unique: true }); // Compound unique index
// Virtual for expired status
memoryEntrySchema.virtual('isExpired').get(function () {
    return this.expiresAt ? this.expiresAt < new Date() : false;
});
// Instance method to update importance
memoryEntrySchema.methods.updateImportance = function (importance) {
    if (importance >= 1 && importance <= 10) {
        this.importance = importance;
        return this.save();
    }
    throw new Error('Importance must be between 1 and 10');
};
// Instance method to add tags
memoryEntrySchema.methods.addTags = function (newTags) {
    const normalizedTags = newTags.map(tag => tag.toLowerCase().trim());
    this.tags = [...new Set([...this.tags, ...normalizedTags])];
    return this.save();
};
// Instance method to remove tags
memoryEntrySchema.methods.removeTags = function (tagsToRemove) {
    const normalizedTags = tagsToRemove.map((tag) => tag.toLowerCase().trim());
    this.tags = this.tags.filter((tag) => !normalizedTags.includes(tag));
    return this.save();
};
// Static method to get user memories with filters
memoryEntrySchema.statics.getUserMemories = function (userId, filters = {}, page = 1, limit = 20) {
    const query = { userId };
    if (filters.type?.length) {
        query.type = { $in: filters.type };
    }
    if (filters.tags?.length) {
        query.tags = { $in: filters.tags.map(tag => tag.toLowerCase()) };
    }
    if (filters.importance) {
        const importanceQuery = {};
        if (filters.importance.min !== undefined) {
            importanceQuery.$gte = filters.importance.min;
        }
        if (filters.importance.max !== undefined) {
            importanceQuery.$lte = filters.importance.max;
        }
        if (Object.keys(importanceQuery).length > 0) {
            query.importance = importanceQuery;
        }
    }
    if (filters.search) {
        query.$or = [
            { key: { $regex: filters.search, $options: 'i' } },
            { description: { $regex: filters.search, $options: 'i' } },
            { tags: { $regex: filters.search, $options: 'i' } },
        ];
    }
    const skip = (page - 1) * limit;
    return this.find(query)
        .sort({ importance: -1, updatedAt: -1 })
        .skip(skip)
        .limit(limit);
};
// Static method to get memory by key
memoryEntrySchema.statics.getUserMemoryByKey = function (userId, key, type) {
    const query = { userId, key };
    if (type) {
        query.type = type;
    }
    return this.findOne(query);
};
// Static method to get memories by type
memoryEntrySchema.statics.getUserMemoriesByType = function (userId, type) {
    return this.find({ userId, type }).sort({ importance: -1, updatedAt: -1 });
};
// Static method to get top memories by importance
memoryEntrySchema.statics.getTopMemories = function (userId, limit = 10) {
    return this.find({ userId })
        .sort({ importance: -1, updatedAt: -1 })
        .limit(limit);
};
// Static method to search memories
memoryEntrySchema.statics.searchMemories = function (userId, searchTerm, limit = 20) {
    return this.find({
        userId,
        $or: [
            { key: { $regex: searchTerm, $options: 'i' } },
            { description: { $regex: searchTerm, $options: 'i' } },
            { tags: { $regex: searchTerm, $options: 'i' } },
        ]
    })
        .sort({ importance: -1, updatedAt: -1 })
        .limit(limit);
};
// Static method to get memory statistics
memoryEntrySchema.statics.getUserMemoryStats = async function (userId) {
    const stats = await this.aggregate([
        { $match: { userId } },
        {
            $group: {
                _id: '$type',
                count: { $sum: 1 },
                avgImportance: { $avg: '$importance' },
            }
        }
    ]);
    const typeCounts = stats.reduce((acc, stat) => {
        acc[stat._id] = {
            count: stat.count,
            avgImportance: Math.round(stat.avgImportance * 10) / 10,
        };
        return acc;
    }, {});
    const total = await this.countDocuments({ userId });
    const highImportance = await this.countDocuments({ userId, importance: { $gte: 8 } });
    // Get most used tags
    const tagStats = await this.aggregate([
        { $match: { userId } },
        { $unwind: '$tags' },
        {
            $group: {
                _id: '$tags',
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
    ]);
    return {
        total,
        byType: typeCounts,
        highImportance,
        topTags: tagStats.map(tag => ({ name: tag._id, count: tag.count })),
    };
};
// Static method to cleanup expired memories
memoryEntrySchema.statics.cleanupExpiredMemories = async function () {
    const result = await this.deleteMany({
        expiresAt: { $lt: new Date() }
    });
    return result.deletedCount;
};
exports.MemoryEntry = mongoose_1.default.model('MemoryEntry', memoryEntrySchema);
//# sourceMappingURL=MemoryEntry.js.map