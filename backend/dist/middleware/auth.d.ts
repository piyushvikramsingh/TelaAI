import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, ApiResponse } from '../types';
export declare const authenticateToken: (req: AuthenticatedRequest, res: Response<ApiResponse>, next: NextFunction) => Promise<void>;
export declare const optionalAuth: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const requirePlan: (allowedPlans: string[]) => (req: AuthenticatedRequest, res: Response<ApiResponse>, next: NextFunction) => void;
export declare const checkCredits: (requiredCredits?: number) => (req: AuthenticatedRequest, res: Response<ApiResponse>, next: NextFunction) => void;
export declare const generateToken: (userId: string) => string;
//# sourceMappingURL=auth.d.ts.map