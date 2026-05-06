
import express from 'express';
const router = express.Router();
import userController from '../controllers/user.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import roleMiddleware from '../middleware/role.middleware.js';

// All user routes require authentication
router.use(authMiddleware);

router.get('/:id/profile', userController.getProfile);
router.put('/:id/profile', userController.updateProfile);

// Example of role-protected route (for Week 2 dashboards)
// router.get('/investors', roleMiddleware('entrepreneur'), userController.listInvestors);
// router.get('/entrepreneurs', roleMiddleware('investor'), userController.listEntrepreneurs);

export default router;