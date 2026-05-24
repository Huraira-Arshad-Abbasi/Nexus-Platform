import express from 'express'
import authMiddleware from '../middleware/auth.middleware.js'
import { validatePayment } from '../middleware/validation.js'
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
router.post('/deposit', validatePayment, deposit)
router.post('/deposit/confirm', confirmDeposit)
router.post('/withdraw', validatePayment, withdraw)
router.post('/transfer', validatePayment, transfer)

export default router