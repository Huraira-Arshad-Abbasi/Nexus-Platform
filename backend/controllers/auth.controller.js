import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.model.js';
import { log } from 'console';
import mongoose from 'mongoose';
import { sendOTPEmail } from '../config/mailer.js'

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

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString()

// In-memory OTP store (use Redis in production)
const otpStore = new Map()

// POST /api/auth/send-otp
export const sendOTP = async (req, res) => {
  try {
    const userId = req.user?.id
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: 'User not found' })

    const otp = generateOTP()
    const expiry = Date.now() + 10 * 60 * 1000 // 10 minutes

    // Store OTP with expiry
    otpStore.set(userId, { otp, expiry })

    // Send email
    await sendOTPEmail(user.email, otp, user.name)

    console.log(`OTP for ${user.email}: ${otp}`) // dev only — remove in production

    res.json({ message: `OTP sent to ${user.email}` })
  } catch (err) {
    console.error('Send OTP error:', err)
    res.status(500).json({ message: 'Failed to send OTP', error: err.message })
  }
}

// POST /api/auth/verify-otp
export const verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body
    const userId = req.user?.id

    const stored = otpStore.get(userId)

    if (!stored)
      return res.status(400).json({ message: 'No OTP found. Please request a new one.' })

    if (Date.now() > stored.expiry) {
      otpStore.delete(userId)
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' })
    }

    if (stored.otp !== otp)
      return res.status(400).json({ message: 'Invalid OTP' })

    otpStore.delete(userId) // clear after successful verification

    res.json({ message: 'OTP verified successfully', verified: true })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}


const authController = {
  register,
  login,
  forgotPassword,
  resetPassword,
  sendOTP,
  verifyOTP
};

export default authController;