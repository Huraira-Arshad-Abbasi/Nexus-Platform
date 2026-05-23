import React, { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { paymentApi, Wallet, Transaction } from '../../api/api'
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'

interface Props {
  stripePromise: any
  onClose: () => void
  onSuccess: (wallet: Wallet, transaction: Transaction) => void
}

const DepositForm: React.FC<{ onClose: () => void; onSuccess: Props['onSuccess'] }> = ({
  onClose,
  onSuccess,
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!stripe || !elements) return
    if (!amount || parseFloat(amount) <= 0) {
      setError('Enter a valid amount')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Step 1 — create PaymentIntent on backend
      const { data } = await paymentApi.deposit(parseFloat(amount))

      // Step 2 — confirm payment with Stripe
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) return

      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: { card: cardElement },
      })

      if (result.error) {
        setError(result.error.message || 'Payment failed')
        return
      }

      // Step 3 — confirm on backend → update balance
      const confirmRes = await paymentApi.confirmDeposit(
        result.paymentIntent.id
      )

      onSuccess(confirmRes.data.wallet, confirmRes.data.transaction)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Deposit failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <Input
        label="Amount (USD)"
        type="number"
        min="1"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        placeholder="e.g. 100"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Details
        </label>
        <div className="p-3 border border-gray-300 rounded-md">
          <CardElement
            options={{
              style: {
                base: { fontSize: '14px', color: '#374151' },
              },
            }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Test card: 4242 4242 4242 4242 | Any future date | Any CVC
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={loading || !stripe}>
          {loading ? 'Processing...' : `Deposit $${amount || '0'}`}
        </Button>
      </div>
    </div>
  )
}

const DepositModal: React.FC<Props> = ({ stripePromise, onClose, onSuccess }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">Deposit Funds</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <Elements stripe={stripePromise}>
            <DepositForm onClose={onClose} onSuccess={onSuccess} />
          </Elements>
        </div>
      </div>
    </div>
  )
}

export default DepositModal