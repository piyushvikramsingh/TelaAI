"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = exports.checkCredits = exports.requirePlan = exports.optionalAuth = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const environment_1 = require("../config/environment");
const logger_1 = require("../utils/logger");
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Access token required'
            });
            return;
        }
        // Verify JWT token
        const decoded = jsonwebtoken_1.default.verify(token, environment_1.config.jwt.secret);
        // Get user from database
        const user = await User_1.User.findById(decoded.userId);
        if (!user || !user.isActive) {
            res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
            return;
        }
        // Update last login
        user.lastLoginAt = new Date();
        await user.save();
        // Attach user to request
        req.user = user;
        next();
    }
    catch (error) {
        logger_1.logger.error('Token authentication failed', { error });
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        else {
            res.status(500).json({
                success: false,
                message: 'Authentication error'
            });
        }
    }
};
exports.authenticateToken = authenticateToken;
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (token) {
            const decoded = jsonwebtoken_1.default.verify(token, environment_1.config.jwt.secret);
            const user = await User_1.User.findById(decoded.userId);
            if (user && user.isActive) {
                req.user = user;
            }
        }
        next();
    }
    catch (error) {
        // Continue without authentication for optional auth
        next();
    }
};
exports.optionalAuth = optionalAuth;
const requirePlan = (allowedPlans) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }
        if (!allowedPlans.includes(req.user.plan)) {
            res.status(403).json({
                success: false,
                message: `This feature requires a ${allowedPlans.join(' or ')} plan`
            });
            return;
        }
        next();
    };
};
exports.requirePlan = requirePlan;
const checkCredits = (requiredCredits = 1) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }
        if (req.user.credits < requiredCredits) {
            res.status(402).json({
                success: false,
                message: 'Insufficient credits'
            });
            return;
        }
        next();
    };
};
exports.checkCredits = checkCredits;
const generateToken = (userId) => {
    return jsonwebtoken_1.default.sign({ userId }, environment_1.config.jwt.secret, {
        expiresIn: environment_1.config.jwt.expiresIn
    });
};
exports.generateToken = generateToken;
//# sourceMappingURL=auth.js.map