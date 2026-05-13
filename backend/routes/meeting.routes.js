import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import {
  scheduleMeeting,
  getMeetings,
  updateMeetingStatus,
  deleteMeeting
} from '../controllers/meeting.controller.js';

const router = express.Router();

router.use(authMiddleware); // all meeting routes require login

router.get('/', getMeetings);
router.post('/', scheduleMeeting);
router.patch('/:id/status', updateMeetingStatus);
router.delete('/:id', deleteMeeting);

export default router;