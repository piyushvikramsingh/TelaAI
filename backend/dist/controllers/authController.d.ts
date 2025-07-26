import { Response } from 'express';
import { AuthenticatedRequest, ApiResponse } from '../types';
export declare class AuthController {
    /**
     * Register a new user
     */
    static register(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void>;
    /**
     * Login user
     */
    static login(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void>;
    /**
     * Get current user profile
     */
    static getProfile(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void>;
    /**
     * Update user profile
     */
    static updateProfile(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void>;
    /**
     * Change user password
     */
    static changePassword(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void>;
    /**
     * Deactivate user account
     */
    static deactivateAccount(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void>;
    /**
     * Refresh token
     */
    static refreshToken(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void>;
}
//# sourceMappingURL=authController.d.ts.map