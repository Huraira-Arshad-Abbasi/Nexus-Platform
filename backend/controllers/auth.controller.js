import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.model.js';
import { log } from 'console';
import mongoose from 'mongoose';

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    if (!name || !email || !password || !role)
      return res.status(400).json({ message: 'All fields are required' });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: 'Email already registered' });
    // Note: The password will be hashed by the pre-save hook in the User model
    const user = new User({ name, email, password, role });
    await user.save();
    const token = generateToken(user._id);

    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    if (!email || !password || !role)
      return res.status(400).json({ message: 'All fields are required' });

    const user = await User.findOne({ email });
  
    if (!user)
      return res.status(401).json({ message: 'Invalid credentials' });

    if (user.role !== role)
      return res.status(401).json({ message: `This account is registered as ${user.role}` });
    const isMatch = await user.comparePassword(password);

    if (!isMatch)
      return res.status(401).json({ message: 'Invalid credentials' });

    user.isOnline = true;
    
    await user.save();

    const token = generateToken(user._id);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always return 200 to prevent email enumeration
    if (!user)
      return res.json({ message: 'If that email exists, a reset link was sent' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // TODO Week 3: send actual email via Nodemailer
    // For now, return token in response (dev mode only)
    res.json({
      message: 'Password reset token generated',
      resetToken: token // remove this in production
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: 'Invalid or expired token' });

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpiry = null;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const authController = {
  register,
  login,
    forgotPassword,
    resetPassword,
};

export default authController;