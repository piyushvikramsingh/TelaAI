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
exports.DesignProject = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const designContentSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.Mixed,
        default: {},
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
}, { _id: true });
const designProjectSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.Mixed,
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
designProjectSchema.virtual('contentCount').get(function () {
    return this.generatedContent.length;
});
// Virtual for latest content
designProjectSchema.virtual('latestContent').get(function () {
    return this.generatedContent.length > 0
        ? this.generatedContent[this.generatedContent.length - 1]
        : null;
});
// Virtual for generation duration (if completed)
designProjectSchema.virtual('generationDuration').get(function () {
    if (this.status !== 'completed')
        return null;
    return this.updatedAt.getTime() - this.createdAt.getTime();
});
// Instance method to add generated content
designProjectSchema.methods.addContent = function (content) {
    this.generatedContent.push({
        ...content,
        timestamp: new Date(),
    });
    return this.save();
};
// Instance method to mark as completed
designProjectSchema.methods.markCompleted = function () {
    this.status = 'completed';
    return this.save();
};
// Instance method to mark as failed
designProjectSchema.methods.markFailed = function (errorMessage) {
    this.status = 'failed';
    if (errorMessage) {
        this.metadata = { ...this.metadata, error: errorMessage };
    }
    return this.save();
};
// Instance method to get project summary
designProjectSchema.methods.getSummary = function () {
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
designProjectSchema.statics.getUserProjects = function (userId, filters = {}, page = 1, limit = 20) {
    const query = { userId };
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
designProjectSchema.statics.getUserProjectStats = async function (userId) {
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
    const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
    return {
        total,
        byStatus: statusCounts,
        byType: typeCounts,
        totalContent: contentStats[0]?.totalContent || 0,
        avgContentPerProject: Math.round((contentStats[0]?.avgContentPerProject || 0) * 10) / 10,
    };
};
// Static method to get recent projects
designProjectSchema.statics.getRecentProjects = function (userId, days = 7, limit = 10) {
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
designProjectSchema.statics.getProjectsByType = function (userId, type, limit = 20) {
    return this.find({ userId, type })
        .sort({ createdAt: -1 })
        .limit(limit);
};
// Static method to search projects
designProjectSchema.statics.searchProjects = function (userId, searchTerm, limit = 20) {
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
designProjectSchema.statics.getFailedProjects = function (userId) {
    return this.find({ userId, status: 'failed' })
        .sort({ createdAt: -1 });
};
// Static method to cleanup old generating projects (potential stuck projects)
designProjectSchema.statics.cleanupStuckProjects = async function (hoursOld = 24) {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hoursOld);
    const result = await this.updateMany({
        status: 'generating',
        createdAt: { $lt: cutoffDate }
    }, {
        $set: {
            status: 'failed',
            'metadata.error': 'Generation timeout - project was stuck in generating state'
        }
    });
    return result.modifiedCount;
};
exports.DesignProject = mongoose_1.default.model('DesignProject', designProjectSchema);
//# sourceMappingURL=DesignProject.js.map