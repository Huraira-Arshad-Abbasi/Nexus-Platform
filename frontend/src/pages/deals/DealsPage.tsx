import React, { useEffect, useState } from 'react'
import { DollarSign, ArrowDownCircle, ArrowUpCircle, ArrowRightCircle, CreditCard } from 'lucide-react'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { paymentApi, Wallet, Transaction } from '../../api/api'
import { loadStripe } from '@stripe/stripe-js'
import DepositModal from './DepositModal'
import WithdrawModal from './WithdrawModal'
import TransferModal from './TransferModal'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

const statusVariant: Record<string, 'success' | 'primary' | 'error'> = {
  completed: 'success',
  pending: 'primary',
  failed: 'error',
}

const typeIcon: Record<string, React.ReactNode> = {
  deposit: <ArrowDownCircle size={18} className="text-green-500" />,
  withdraw: <ArrowUpCircle size={18} className="text-red-500" />,
  transfer: <ArrowRightCircle size={18} className="text-blue-500" />,
}

export const DealsPage: React.FC = () => {
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showDeposit, setShowDeposit] = useState(false)
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [showTransfer, setShowTransfer] = useState(false)

  const fetchData = async () => {
    try {
      const [walletRes, txRes] = await Promise.all([
        paymentApi.getWallet(),
        paymentApi.getTransactions(),
      ])
      setWallet(walletRes.data.wallet)
      setTransactions(txRes.data.transactions)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleSuccess = (updatedWallet: Wallet, newTransaction: Transaction) => {
    setWallet(updatedWallet)
    setTransactions(prev => [newTransaction, ...prev])
    setShowDeposit(false)
    setShowWithdraw(false)
    setShowTransfer(false)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-600">Manage your wallet and transactions</p>
      </div>

      {/* Wallet card */}
      <Card>
        <CardBody className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-primary-50 rounded-xl">
                <CreditCard size={32} className="text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Available Balance</p>
                <p className="text-4xl font-bold text-gray-900 mt-1">
                  ${wallet?.balance?.toFixed(2) || '0.00'}
                </p>
                <p className="text-xs text-gray-400 mt-1 uppercase">
                  {wallet?.currency || 'USD'}
                </p>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <Button
                leftIcon={<ArrowDownCircle size={18} />}
                onClick={() => setShowDeposit(true)}
              >
                Deposit
              </Button>
              <Button
                variant="outline"
                leftIcon={<ArrowUpCircle size={18} />}
                onClick={() => setShowWithdraw(true)}
              >
                Withdraw
              </Button>
              <Button
                variant="outline"
                leftIcon={<ArrowRightCircle size={18} />}
                onClick={() => setShowTransfer(true)}
              >
                Transfer
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: 'Total Deposited',
            value: transactions
              .filter(t => t.type === 'deposit' && t.status === 'completed')
              .reduce((sum, t) => sum + t.amount, 0)
              .toFixed(2),
            color: 'text-green-600',
          },
          {
            label: 'Total Withdrawn',
            value: transactions
              .filter(t => t.type === 'withdraw' && t.status === 'completed')
              .reduce((sum, t) => sum + t.amount, 0)
              .toFixed(2),
            color: 'text-red-600',
          },
          {
            label: 'Transactions',
            value: transactions.length,
            color: 'text-primary-600',
          },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardBody className="p-4 text-center">
              <p className={`text-2xl font-bold ${color}`}>${value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Transaction history */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">
            Transaction History
            <span className="ml-2 text-sm text-gray-400">({transactions.length})</span>
          </h2>
        </CardHeader>
        <CardBody>
          {loading ? (
            <p className="text-center text-gray-500 py-8">Loading...</p>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No transactions yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Make your first deposit to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map(tx => (
                <div
                  key={tx._id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-50 rounded-full">
                      {typeIcon[tx.type]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {tx.type}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{tx.description}</p>
                      {tx.type === 'transfer' && tx.toUser && (
                        <p className="text-xs text-gray-400">
                          To: {tx.toUser.name}
                        </p>
                      )}
                      {tx.type === 'transfer' && tx.fromUser && !tx.toUser && (
                        <p className="text-xs text-gray-400">
                          From: {tx.fromUser.name}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">
                        {new Date(tx.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-base font-semibold ${
                      tx.type === 'deposit' ? 'text-green-600' :
                      tx.type === 'withdraw' ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </span>
                    <Badge variant={statusVariant[tx.status]}>
                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Modals */}
      {showDeposit && (
        <DepositModal
          stripePromise={stripePromise}
          onClose={() => setShowDeposit(false)}
          onSuccess={handleSuccess}
        />
      )}
      {showWithdraw && (
        <WithdrawModal
          balance={wallet?.balance || 0}
          onClose={() => setShowWithdraw(false)}
          onSuccess={handleSuccess}
        />
      )}
      {showTransfer && (
        <TransferModal
          balance={wallet?.balance || 0}
          onClose={() => setShowTransfer(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}