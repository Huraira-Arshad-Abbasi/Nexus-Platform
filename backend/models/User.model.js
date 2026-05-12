import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // Core Fields
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['entrepreneur', 'investor'], required: true },

  // Shared Profile Fields
  avatarUrl: { type: String, default: '' },
  bio: { type: String, default: '' },

  // Entrepreneur Fields
  startupName: String,
  pitchSummary: String,
  fundingNeeded: String,
  industry: String,

  // Investor Fields
  investmentInterests: [String],
  investmentStage: [String],
  totalInvestments: { type: Number, default: 0 },

  // Password Reset (needed for Week 3)
  resetPasswordToken: String,
  resetPasswordExpiry: Date,

}, { timestamps: true });

// ── Hash password before save ──────────────────────────────
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10); // 10 not 12
});

// ── Compare password on login ──────────────────────────────
userSchema.methods.comparePassword = function (candidatePassword) {
 
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Strip sensitive fields from responses ─────────────────
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpiry;
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  return obj;
};


const User = mongoose.model('User', userSchema);
export default User;