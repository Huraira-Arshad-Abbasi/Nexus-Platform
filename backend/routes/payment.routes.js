import express from 'express'
import authMiddleware from '../middleware/auth.middleware.js'
import {
  getWallet,
  getTransactions,
  deposit,
  confirmDeposit,
  withdraw,
  transfer,
} from '../controllers/payment.controller.js'

const router = express.Router()
router.use(authMiddleware)

router.get('/wallet', getWallet)
router.get('/transactions', getTransactions)
router.post('/deposit', deposit)
router.post('/deposit/confirm', confirmDeposit)
router.post('/withdraw', withdraw)
router.post('/transfer', transfer)

export default router