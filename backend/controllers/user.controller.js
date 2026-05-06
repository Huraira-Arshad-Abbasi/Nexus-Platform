import User from '../models/User.model.js';

// GET /api/users/:id/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: 'User not found' });

    // Only the user themselves or admin can view full profile
    if (req.user.id !== req.params.id)
      return res.status(403).json({ message: 'Forbidden' });

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/users/:id/profile
const updateProfile = async (req, res) => {
  try {
    if (req.user.id !== req.params.id)
      return res.status(403).json({ message: 'Forbidden' });

    // Fields that must never be updated via this route
    const forbidden = ['password', 'email', 'role', 'resetPasswordToken', 'resetPasswordExpiry'];
    forbidden.forEach((f) => delete req.body[f]);

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!user)
      return res.status(404).json({ message: 'User not found' });

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const userController = {
  getProfile,
  updateProfile,
};

export default userController;