import React, { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { paymentApi, Wallet, Transaction } from '../../api/api'

interface Props {
  balance: number
  onClose: () => void
  onSuccess: (wallet: Wallet, transaction: Transaction) => void
}

const WithdrawModal: React.FC<Props> = ({ balance, onClose, onSuccess }) => {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleWithdraw = async () => {
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) return setError('Enter a valid amount')
    if (amt > balance) return setError('Insufficient balance')

    setLoading(true)
    setError('')
    try {
      const { data } = await paymentApi.withdraw(amt)
      onSuccess(data.wallet, data.transaction)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Withdrawal failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">Withdraw Funds</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            Available balance: <span className="font-semibold">${balance.toFixed(2)}</span>
          </p>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          <Input
            label="Amount (USD)"
            type="number"
            min="1"
            max={balance}
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="e.g. 50"
          />
          <p className="text-xs text-gray-400">
            Note: This is a mock withdrawal. No real bank transfer occurs.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleWithdraw} disabled={loading}>
              {loading ? 'Processing...' : `Withdraw $${amount || '0'}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WithdrawModal