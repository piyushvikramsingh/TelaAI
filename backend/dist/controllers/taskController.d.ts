import { Response } from 'express';
import { AuthenticatedRequest, ApiResponse } from '../types';
export declare class TaskController {
    /**
     * Create a new task
     */
    static createTask(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void>;
    /**
     * Get user tasks with filters
     */
    static getTasks(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void>;
    /**
     * Get specific task
     */
    static getTask(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void>;
    /**
     * Update task
     */
    static updateTask(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void>;
    /**
     * Delete task
     */
    static deleteTask(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void>;
    /**
     * Generate AI task suggestions
     */
    static generateTasks(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void>;
    /**
     * Get task statistics
     */
    static getStats(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void>;
    /**
     * Mark task as completed
     */
    static completeTask(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void>;
}
//# sourceMappingURL=taskController.d.ts.map