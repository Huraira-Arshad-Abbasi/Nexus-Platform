import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import { validateMeeting } from '../middleware/validation.js'
import {
  scheduleMeeting,
  getMeetings,
  updateMeetingStatus,
  deleteMeeting
} from '../controllers/meeting.controller.js';

const router = express.Router();

router.use(authMiddleware); // all meeting routes require login

router.get('/', authMiddleware, getMeetings);
router.post('/', authMiddleware, validateMeeting, scheduleMeeting);
router.patch('/:id/status', authMiddleware, updateMeetingStatus);
router.delete('/:id', authMiddleware, deleteMeeting);

export default router;