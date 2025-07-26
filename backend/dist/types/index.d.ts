import { Request } from 'express';
import { Document } from 'mongoose';
export interface IUser extends Document {
    _id: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    plan: 'free' | 'pro' | 'enterprise';
    credits: number;
    isActive: boolean;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
    canPerformAction(action: string): boolean;
    deductCredits(amount: number): Promise<boolean>;
}
export interface AuthenticatedRequest extends Request {
    user?: IUser;
}
export interface IChatConversation extends Document {
    _id: string;
    userId: string;
    title: string;
    messages: IChatMessage[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    addMessage(message: Omit<IChatMessage, '_id' | 'timestamp'>): Promise<IChatConversation>;
    getSummary(): any;
}
export interface IChatMessage {
    _id?: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    tokenCount?: number;
    model?: string;
}
export interface ITask extends Document {
    _id: string;
    userId: string;
    title: string;
    description?: string;
    category: 'coding' | 'design' | 'analysis' | 'writing' | 'other';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    dueDate?: Date;
    aiGenerated: boolean;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    markCompleted(): Promise<ITask>;
    updatePriority(priority: string): Promise<ITask>;
}
export interface IMemoryEntry extends Document {
    _id: string;
    userId: string;
    type: 'preference' | 'context' | 'skill' | 'project' | 'note';
    key: string;
    value: any;
    description?: string;
    importance: number;
    tags: string[];
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface IFile extends Document {
    _id: string;
    userId: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    path: string;
    url?: string;
    category: 'image' | 'document' | 'code' | 'data' | 'other';
    metadata?: Record<string, any>;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface IDesignProject extends Document {
    _id: string;
    userId: string;
    name: string;
    description?: string;
    type: 'ui' | 'logo' | 'banner' | 'illustration' | 'other';
    prompt: string;
    generatedContent: IDesignContent[];
    status: 'generating' | 'completed' | 'failed';
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
export interface IDesignContent {
    _id?: string;
    type: 'image' | 'code' | 'text';
    content: string;
    url?: string;
    metadata?: Record<string, any>;
    timestamp: Date;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: string[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export interface OpenAIMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}
export interface OpenAICompletionOptions {
    model?: string;
    maxTokens?: number;
    temperature?: number;
    stream?: boolean;
}
export interface SocketUser {
    userId: string;
    socketId: string;
    connectedAt: Date;
}
export interface IAnalytics extends Document {
    _id: string;
    userId: string;
    event: string;
    data: Record<string, any>;
    timestamp: Date;
    sessionId?: string;
    userAgent?: string;
    ipAddress?: string;
}
export interface PlanLimits {
    monthlyCredits: number;
    maxConversations: number;
    maxFiles: number;
    maxMemoryEntries: number;
    maxTasksPerMonth: number;
    prioritySupport: boolean;
    advancedFeatures: boolean;
}
//# sourceMappingURL=index.d.ts.map