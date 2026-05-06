import express from 'express';
const router = express.Router();
import authController from '../controllers/auth.controller.js';

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

export default router;