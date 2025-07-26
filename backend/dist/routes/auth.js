"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
// Public routes
router.post('/register', validation_1.validateRegister, authController_1.AuthController.register);
router.post('/login', validation_1.validateLogin, authController_1.AuthController.login);
// Protected routes
router.get('/profile', auth_1.authenticateToken, authController_1.AuthController.getProfile);
router.put('/profile', auth_1.authenticateToken, authController_1.AuthController.updateProfile);
router.post('/change-password', auth_1.authenticateToken, authController_1.AuthController.changePassword);
router.post('/deactivate', auth_1.authenticateToken, authController_1.AuthController.deactivateAccount);
router.post('/refresh-token', auth_1.authenticateToken, authController_1.AuthController.refreshToken);
exports.default = router;
//# sourceMappingURL=auth.js.map