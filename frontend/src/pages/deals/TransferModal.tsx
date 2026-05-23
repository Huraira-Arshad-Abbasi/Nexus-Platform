import React, { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { paymentApi, userApi, Wallet, Transaction } from '../../api/api'
import { useAuth } from '../../context/useAuth'

interface Props {
  balance: number
  onClose: () => void
  onSuccess: (wallet: Wallet, transaction: Transaction) => void
}

const TransferModal: React.FC<Props> = ({ balance, onClose, onSuccess }) => {
  const { user } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  const [toUserId, setToUserId] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    userApi.getAllUsers()
      .then(({ data }) => {
        const currentId = user?.id || ''
        setUsers(data.users.filter((u: any) => (u.id || u._id) !== currentId))
      })
      .catch(console.error)
  }, [user?.id])

  const handleTransfer = async () => {
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) return setError('Enter a valid amount')
    if (amt > balance) return setError('Insufficient balance')
    if (!toUserId) return setError('Select a recipient')

    setLoading(true)
    setError('')
    try {
      const { data } = await paymentApi.transfer(amt, toUserId)
      onSuccess(data.wallet, data.transaction)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Transfer failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">Transfer Funds</h2>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Send To
            </label>
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={toUserId}
              onChange={e => setToUserId(e.target.value)}
            >
              <option value="">Select recipient...</option>
              {users.map(u => (
                <option key={u._id || u.id} value={u._id || u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Amount (USD)"
            type="number"
            min="1"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="e.g. 25"
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleTransfer} disabled={loading}>
              {loading ? 'Transferring...' : `Transfer $${amount || '0'}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TransferModal