import Stripe from 'stripe'
import Transaction from '../models/Transaction.model.js'
import Wallet from '../models/Wallet.model.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// ── Get or create wallet ───────────────────────
const getOrCreateWallet = async (userId) => {
  let wallet = await Wallet.findOne({ userId })
  if (!wallet) wallet = await Wallet.create({ userId })
  return wallet
}

// GET /api/payments/wallet
export const getWallet = async (req, res) => {
  try {
    const wallet = await getOrCreateWallet(req.user.id)
    res.json({ wallet })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/payments/transactions
export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id })
      .populate('fromUser', 'name email')
      .populate('toUser', 'name email')
      .sort({ createdAt: -1 })
    res.json({ transactions })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/payments/deposit
export const deposit = async (req, res) => {
  try {
    const { amount } = req.body // amount in dollars
    if (!amount || amount <= 0)
      return res.status(400).json({ message: 'Valid amount required' })

    // Create Stripe PaymentIntent (amount in cents)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      metadata: { userId: req.user.id },
    })

    // Create pending transaction
    const transaction = await Transaction.create({
      userId: req.user.id,
      type: 'deposit',
      amount,
      status: 'pending',
      stripePaymentIntentId: paymentIntent.id,
      description: `Deposit of $${amount}`,
    })

    res.json({
      clientSecret: paymentIntent.client_secret,
      transaction,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/payments/deposit/confirm
// Called after Stripe payment succeeds on frontend
export const confirmDeposit = async (req, res) => {
  try {
    const { paymentIntentId } = req.body

    // Verify with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status !== 'succeeded')
      return res.status(400).json({ message: 'Payment not successful' })

    // Update transaction
    const transaction = await Transaction.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntentId },
      { status: 'completed' },
      { new: true }
    )

    if (!transaction)
      return res.status(404).json({ message: 'Transaction not found' })

    // Update wallet balance
    const amount = paymentIntent.amount / 100 // convert cents to dollars
    const wallet = await getOrCreateWallet(req.user.id)
    wallet.balance += amount
    await wallet.save()

    res.json({ transaction, wallet })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/payments/withdraw
export const withdraw = async (req, res) => {
  try {
    const { amount } = req.body
    if (!amount || amount <= 0)
      return res.status(400).json({ message: 'Valid amount required' })

    const wallet = await getOrCreateWallet(req.user.id)

    if (wallet.balance < amount)
      return res.status(400).json({ message: 'Insufficient balance' })

    // Deduct balance
    wallet.balance -= amount
    await wallet.save()

    const transaction = await Transaction.create({
      userId: req.user.id,
      type: 'withdraw',
      amount,
      status: 'completed',
      description: `Withdrawal of $${amount}`,
    })

    res.json({ transaction, wallet })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/payments/transfer
export const transfer = async (req, res) => {
  try {
    const { amount, toUserId } = req.body
    if (!amount || amount <= 0)
      return res.status(400).json({ message: 'Valid amount required' })
    if (!toUserId)
      return res.status(400).json({ message: 'Recipient required' })
    if (toUserId === req.user.id)
      return res.status(400).json({ message: 'Cannot transfer to yourself' })

    const senderWallet = await getOrCreateWallet(req.user.id)
    if (senderWallet.balance < amount)
      return res.status(400).json({ message: 'Insufficient balance' })

    // Deduct from sender
    senderWallet.balance -= amount
    await senderWallet.save()

    // Add to receiver
    const receiverWallet = await getOrCreateWallet(toUserId)
    receiverWallet.balance += amount
    await receiverWallet.save()

    // Record transaction for sender
    const transaction = await Transaction.create({
      userId: req.user.id,
      type: 'transfer',
      amount,
      status: 'completed',
      fromUser: req.user.id,
      toUser: toUserId,
      description: `Transfer of $${amount}`,
    })

    // Record transaction for receiver too
    await Transaction.create({
      userId: toUserId,
      type: 'transfer',
      amount,
      status: 'completed',
      fromUser: req.user.id,
      toUser: toUserId,
      description: `Received transfer of $${amount}`,
    })

    res.json({ transaction, wallet: senderWallet })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}