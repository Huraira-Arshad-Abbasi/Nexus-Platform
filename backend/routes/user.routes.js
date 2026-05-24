
import express from 'express';
const router = express.Router();
import userController from '../controllers/user.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import roleMiddleware from '../middleware/role.middleware.js';
import { validateProfileUpdate } from '../middleware/validation.js'

// All user routes require authentication
router.use(authMiddleware);

router.get('/:id/profile', userController.getProfile);
router.put('/:id/profile',authMiddleware, validateProfileUpdate, userController.updateProfile);
router.get('/', userController.getAllUsers); // for meeting scheduling dropdown

// Example of role-protected route (for Week 2 dashboards)
// router.get('/investors', roleMiddleware('entrepreneur'), userController.listInvestors);
// router.get('/entrepreneurs', roleMiddleware('investor'), userController.listEntrepreneurs);

export default router;