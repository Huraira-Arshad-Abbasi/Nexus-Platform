import express from 'express';
const router = express.Router();

import authController from '../controllers/auth.controller.js';
import { validateRegister, validateLogin } from '../middleware/validation.js'
import authMiddleware from '../middleware/auth.middleware.js'
import { otpLimiter } from '../middleware/rateLimiter.js'
import { validateOTP } from '../middleware/validation.js'

router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/send-otp', authMiddleware, otpLimiter, authController.sendOTP)
router.post('/verify-otp',authMiddleware, validateOTP, authController.verifyOTP)

export default router;