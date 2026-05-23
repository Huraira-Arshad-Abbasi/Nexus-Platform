import mongoose from 'mongoose'

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['deposit', 'withdraw', 'transfer'], required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'usd' },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  stripePaymentIntentId: { type: String, default: '' },
  description: { type: String, default: '' },
  // For transfers
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true })

const Transaction = mongoose.model('Transaction', transactionSchema)
export default Transaction