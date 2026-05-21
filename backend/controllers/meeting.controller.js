import Meeting from '../models/Meeting.model.js';

// POST /api/meetings — schedule a new meeting
export const scheduleMeeting = async (req, res) => {
  try {
    const { title, scheduledWith, date, duration, message } = req.body;
    const scheduledBy = req.user.id;
    
    if (!title || !scheduledWith || !date)
      return res.status(400).json({ message: 'Title, participant and date are required' });

    // ── Conflict detection ─────────────────────────────
    const meetingDate = new Date(date);
    const meetingEnd = new Date(meetingDate.getTime() + (duration || 30) * 60000);

    const conflict = await Meeting.findOne({
      status: { $in: ['pending', 'accepted'] },
      $or: [{ scheduledBy }, { scheduledWith: scheduledBy }],
      date: {
        $gte: new Date(meetingDate.getTime() - (duration || 30) * 60000),
        $lte: meetingEnd,
      }
    });

    if (conflict)
      return res.status(409).json({ message: 'You already have a meeting in this time slot' });

    const meeting = await Meeting.create({
      title, scheduledBy, scheduledWith, date: meetingDate, duration, message
    });

    // Populate participant info before returning
    const populated = await Meeting.findById(meeting._id)
      .populate('scheduledBy', 'name email avatarUrl role')
      .populate('scheduledWith', 'name email avatarUrl role');

    res.status(201).json({ meeting: populated });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/meetings — get all meetings for logged in user
export const getMeetings = async (req, res) => {
  try {
    const userId = req.user.id;

    const meetings = await Meeting.find({
      $or: [{ scheduledBy: userId }, { scheduledWith: userId }]
    })
      .populate('scheduledBy', 'name email avatarUrl role')
      .populate('scheduledWith', 'name email avatarUrl role')
      .sort({ date: 1 }); // ascending by date

    res.json({ meetings });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PATCH /api/meetings/:id/status — accept or reject
export const updateMeetingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const userId = req.user.id;

    if (!['accepted', 'rejected', 'cancelled'].includes(status))
      return res.status(400).json({ message: 'Invalid status' });

    const meeting = await Meeting.findById(req.params.id);
    if (!meeting)
      return res.status(404).json({ message: 'Meeting not found' });

    // Only the recipient can accept/reject
    // Only the organizer can cancel
    if (status === 'cancelled' && meeting.scheduledBy.toString() !== userId)
      return res.status(403).json({ message: 'Only the organizer can cancel' });

    if (['accepted', 'rejected'].includes(status) && meeting.scheduledWith.toString() !== userId)
      return res.status(403).json({ message: 'Only the recipient can accept or reject' });

    meeting.status = status;
    await meeting.save();

    const populated = await Meeting.findById(meeting._id)
      .populate('scheduledBy', 'name email avatarUrl role')
      .populate('scheduledWith', 'name email avatarUrl role');

    res.json({ meeting: populated });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/meetings/:id — delete a meeting
export const deleteMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting)
      return res.status(404).json({ message: 'Meeting not found' });

    if (meeting.scheduledBy.toString() !== req.user.id)
      return res.status(403).json({ message: 'Only the organizer can delete' });

    await meeting.deleteOne();
    res.json({ message: 'Meeting deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};