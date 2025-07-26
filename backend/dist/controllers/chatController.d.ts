import { Response } from 'express';
import { AuthenticatedRequest, ApiResponse } from '../types';
export declare class ChatController {
    /**
     * Send a message and get AI response
     */
    static sendMessage(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void>;
    /**
     * Get user conversations
     */
    static getConversations(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void>;
    /**
     * Get specific conversation
     */
    static getConversation(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void>;
    /**
     * Update conversation title
     */
    static updateConversation(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void>;
    /**
     * Delete conversation
     */
    static deleteConversation(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void>;
    /**
     * Get chat statistics
     */
    static getStats(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void>;
    /**
     * Extract and store important information from conversation
     */
    private static extractAndStoreMemory;
}
//# sourceMappingURL=chatController.d.ts.map