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
exports.File = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const fileSchema = new mongoose_1.Schema({
    userId: {
        type: String,
        required: true,
        index: true,
    },
    filename: {
        type: String,
        required: true,
        trim: true,
    },
    originalName: {
        type: String,
        required: true,
        trim: true,
    },
    mimeType: {
        type: String,
        required: true,
    },
    size: {
        type: Number,
        required: true,
    },
    path: {
        type: String,
        required: true,
    },
    url: {
        type: String,
    },
    category: {
        type: String,
        enum: ['image', 'document', 'code', 'data', 'other'],
        default: function () {
            const mimeType = this.mimeType.toLowerCase();
            if (mimeType.startsWith('image/'))
                return 'image';
            if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text'))
                return 'document';
            if (mimeType.includes('json') || mimeType.includes('csv') || mimeType.includes('xml'))
                return 'data';
            if (mimeType.includes('javascript') || mimeType.includes('python') || mimeType.includes('java'))
                return 'code';
            return 'other';
        },
    },
    metadata: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {},
    },
    isPublic: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
// Indexes
fileSchema.index({ userId: 1, category: 1 });
fileSchema.index({ userId: 1, mimeType: 1 });
fileSchema.index({ userId: 1, size: 1 });
fileSchema.index({ userId: 1, createdAt: -1 });
fileSchema.index({ filename: 1 });
fileSchema.index({ isPublic: 1 });
// Virtual for file extension
fileSchema.virtual('extension').get(function () {
    const parts = this.originalName.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
});
// Virtual for size in human readable format
fileSchema.virtual('sizeFormatted').get(function () {
    const bytes = this.size;
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});
// Virtual for file type description
fileSchema.virtual('typeDescription').get(function () {
    const mimeType = this.mimeType.toLowerCase();
    if (mimeType.startsWith('image/')) {
        return 'Image';
    }
    else if (mimeType.includes('pdf')) {
        return 'PDF Document';
    }
    else if (mimeType.includes('document') || mimeType.includes('word')) {
        return 'Document';
    }
    else if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
        return 'Spreadsheet';
    }
    else if (mimeType.includes('json')) {
        return 'JSON Data';
    }
    else if (mimeType.includes('csv')) {
        return 'CSV Data';
    }
    else if (mimeType.includes('javascript')) {
        return 'JavaScript Code';
    }
    else if (mimeType.includes('python')) {
        return 'Python Code';
    }
    else if (mimeType.includes('text')) {
        return 'Text File';
    }
    return 'File';
});
// Instance method to update metadata
fileSchema.methods.updateMetadata = function (newMetadata) {
    this.metadata = { ...this.metadata, ...newMetadata };
    return this.save();
};
// Instance method to toggle public status
fileSchema.methods.togglePublic = function () {
    this.isPublic = !this.isPublic;
    return this.save();
};
// Static method to get user files with filters
fileSchema.statics.getUserFiles = function (userId, filters = {}, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc') {
    const query = { userId };
    if (filters.category?.length) {
        query.category = { $in: filters.category };
    }
    if (filters.mimeType?.length) {
        query.mimeType = { $in: filters.mimeType };
    }
    if (filters.minSize !== undefined || filters.maxSize !== undefined) {
        const sizeQuery = {};
        if (filters.minSize !== undefined) {
            sizeQuery.$gte = filters.minSize;
        }
        if (filters.maxSize !== undefined) {
            sizeQuery.$lte = filters.maxSize;
        }
        query.size = sizeQuery;
    }
    if (filters.search) {
        query.$or = [
            { filename: { $regex: filters.search, $options: 'i' } },
            { originalName: { $regex: filters.search, $options: 'i' } },
        ];
    }
    if (filters.isPublic !== undefined) {
        query.isPublic = filters.isPublic;
    }
    const skip = (page - 1) * limit;
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    return this.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit);
};
// Static method to get file statistics
fileSchema.statics.getUserFileStats = async function (userId) {
    const stats = await this.aggregate([
        { $match: { userId } },
        {
            $group: {
                _id: '$category',
                count: { $sum: 1 },
                totalSize: { $sum: '$size' },
                avgSize: { $avg: '$size' },
            }
        }
    ]);
    const categoryCounts = stats.reduce((acc, stat) => {
        acc[stat._id] = {
            count: stat.count,
            totalSize: stat.totalSize,
            avgSize: Math.round(stat.avgSize),
        };
        return acc;
    }, {});
    const totalFiles = await this.countDocuments({ userId });
    const totalSize = await this.aggregate([
        { $match: { userId } },
        { $group: { _id: null, total: { $sum: '$size' } } }
    ]);
    const publicFiles = await this.countDocuments({ userId, isPublic: true });
    // Get mime type breakdown
    const mimeStats = await this.aggregate([
        { $match: { userId } },
        {
            $group: {
                _id: '$mimeType',
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
    ]);
    return {
        totalFiles,
        totalSize: totalSize[0]?.total || 0,
        publicFiles,
        byCategory: categoryCounts,
        topMimeTypes: mimeStats.map(mime => ({ type: mime._id, count: mime.count })),
    };
};
// Static method to search files
fileSchema.statics.searchFiles = function (userId, searchTerm, limit = 20) {
    return this.find({
        userId,
        $or: [
            { filename: { $regex: searchTerm, $options: 'i' } },
            { originalName: { $regex: searchTerm, $options: 'i' } },
            { 'metadata.description': { $regex: searchTerm, $options: 'i' } },
            { 'metadata.tags': { $regex: searchTerm, $options: 'i' } },
        ]
    })
        .sort({ createdAt: -1 })
        .limit(limit);
};
// Static method to get files by category
fileSchema.statics.getFilesByCategory = function (userId, category, limit = 20) {
    return this.find({ userId, category })
        .sort({ createdAt: -1 })
        .limit(limit);
};
// Static method to get large files
fileSchema.statics.getLargeFiles = function (userId, minSize = 5 * 1024 * 1024) {
    return this.find({ userId, size: { $gte: minSize } })
        .sort({ size: -1 })
        .limit(50);
};
// Static method to get recently uploaded files
fileSchema.statics.getRecentFiles = function (userId, days = 7, limit = 20) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return this.find({
        userId,
        createdAt: { $gte: cutoffDate }
    })
        .sort({ createdAt: -1 })
        .limit(limit);
};
exports.File = mongoose_1.default.model('File', fileSchema);
//# sourceMappingURL=File.js.map