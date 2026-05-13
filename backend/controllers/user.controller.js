import User from '../models/User.model.js';

// GET /api/users/:id/profile — any logged in user can view
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user }); // remove the ownership check from GET
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/users/:id/profile — only owner can update
export const updateProfile = async (req, res) => {
  try {
    if (req.user.id !== req.params.id)
      return res.status(403).json({ message: 'Forbidden' });

    const forbidden = ['password', 'email', 'role'];
    forbidden.forEach((f) => delete req.body[f]);

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

//GET /api/users — get all users (for meeting scheduling)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select('name email role avatarUrl');
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const userController = {
  getProfile,
  updateProfile,
  getAllUsers
};

export default userController;