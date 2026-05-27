'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import api from '@/lib/api';
import { formatCurrency, formatDate, formatRelativeTime, getStatusColor, getTypeLabel } from '@/lib/utils';
import {
  ArrowLeft, Phone, MessageCircle, IndianRupee,
  Send, Pencil, Trash2, ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface CustomerDetail {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  whatsappPhone: string | null;
  address: string | null;
  notes: string | null;
  balance: number;
  createdAt: string;
  transactions: Transaction[];
}

interface Transaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  description: string | null;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  createdAt: string;
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const customerId = params.id as string;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  const { data, isLoading, error } = useQuery<{ customer: CustomerDetail }>({
    queryKey: ['customer', customerId],
    queryFn: () => api.get(`/customers/${customerId}`),
    enabled: !!customerId,
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/customers/${customerId}`),
    onSuccess: () => {
      toast.success('Customer removed');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      router.push('/customers');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to remove customer'),
  });

  const handleSendReminder = async () => {
    if (!data?.customer) return;
    setSendingReminder(true);
    try {
      const result: any = await api.post('/reminders/quick', {
        customerId: data.customer.id,
        template: 'friendly',
        customMessage: customMessage.trim() || undefined,
      });
      if (result.whatsappUrl) {
        window.open(result.whatsappUrl, '_blank');
        toast.success('WhatsApp opened!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to send reminder');
    } finally {
      setSendingReminder(false);
    }
  };

  const customer = data?.customer;

  if (isLoading) {
    return (
      <div className="p-4 space-y-4 max-w-lg mx-auto animate-pulse">
        <div className="flex items-center gap-3">
          <div className="skeleton w-10 h-10 rounded-lg" />
          <div className="skeleton h-6 w-32" />
        </div>
        <div className="skeleton h-32 rounded-2xl" />
        <div className="grid grid-cols-2 gap-3">
          <div className="skeleton h-16 rounded-xl" />
          <div className="skeleton h-16 rounded-xl" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-16 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="empty-state">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <IndianRupee size={28} className="text-red-400" />
        </div>
        <p className="text-slate-600 font-medium">Customer not found</p>
        <p className="text-slate-400 text-sm mt-1">This customer may have been removed</p>
        <Link href="/customers" className="btn-primary mt-4">
          <ArrowLeft size={16} className="mr-1" /> Back to Customers
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-5 max-w-lg mx-auto">
      {/* ---- Header ---- */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-lg hover:bg-slate-100"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-slate-900">{customer.name}</h1>
        </div>
        <div className="flex items-center gap-1">
          <Link
            href={`/customers/${customer.id}/edit`}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
          >
            <Pencil size={18} />
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </motion.div>

      {/* ---- Info Card ---- */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-touch space-y-2"
      >
        {customer.phone && (
          <div className="flex items-center gap-3 text-sm">
            <Phone size={16} className="text-slate-400 flex-shrink-0" />
            <a href={`tel:${customer.phone}`} className="text-primary-600 font-medium">
              {customer.phone}
            </a>
          </div>
        )}
        {customer.email && (
          <div className="flex items-center gap-3 text-sm">
            <MessageCircle size={16} className="text-slate-400 flex-shrink-0" />
            <span className="text-slate-600">{customer.email}</span>
          </div>
        )}
        {customer.address && (
          <p className="text-sm text-slate-500 pl-7">{customer.address}</p>
        )}
        {customer.notes && (
          <div className="mt-2 pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-400 mb-1">Notes</p>
            <p className="text-sm text-slate-600">{customer.notes}</p>
          </div>
        )}
      </motion.div>

      {/* ---- Balance Display ---- */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.05 }}
        className={`rounded-2xl p-5 text-white shadow-lg ${
          customer.balance > 0
            ? 'bg-gradient-to-br from-red-500 to-red-700 shadow-red-200'
            : customer.balance < 0
            ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-emerald-200'
            : 'bg-gradient-to-br from-slate-500 to-slate-700 shadow-slate-200'
        }`}
      >
        <p className="text-sm font-medium opacity-90">
          {customer.balance > 0
            ? 'Money to Receive'
            : customer.balance < 0
            ? 'Money to Return'
            : 'All Settled 🎉'}
        </p>
        <p className="text-3xl font-bold tracking-tight mt-1">
          {formatCurrency(Math.abs(customer.balance))}
        </p>
        <p className="text-xs opacity-75 mt-2">
          Customer since {formatDate(customer.createdAt, 'long')}
        </p>
      </motion.div>

      {/* ---- Custom Message (only when balance > 0) ---- */}
      {customer.balance > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <label className="text-xs font-medium text-slate-500 mb-1 block">
            Optional Message
          </label>
          <textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Add a personal note to the reminder..."
            rows={2}
            className="input-touch w-full text-sm resize-none"
            maxLength={500}
          />
          <p className="text-2xs text-slate-400 mt-1 text-right">{customMessage.length}/500</p>
        </motion.div>
      )}

      {/* ---- Quick Actions ---- */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-2"
      >
        <Link
          href={`/transactions/new?customerId=${customer.id}`}
          className="btn-primary !py-3 !text-sm flex items-center justify-center gap-2"
        >
          <IndianRupee size={16} /> Add Entry
        </Link>

        {customer.balance > 0 && (
          <button
            onClick={handleSendReminder}
            disabled={sendingReminder}
            className="btn-touch !py-3 !text-sm bg-amber-500 text-white hover:bg-amber-600 shadow-sm shadow-amber-200 flex items-center justify-center gap-2"
          >
            {sendingReminder ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Sending...
              </span>
            ) : (
              <>
                <Send size={16} /> Send Reminder
              </>
            )}
          </button>
        )}

        {customer.phone && (
          <a
            href={`tel:${customer.phone}`}
            className="btn-secondary !py-3 !text-sm flex items-center justify-center gap-2"
          >
            <Phone size={16} /> Call
          </a>
        )}

        {customer.phone && (
          <button
            onClick={handleSendReminder}
            disabled={sendingReminder}
            className="btn-touch !py-3 !text-sm bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm shadow-emerald-200 flex items-center justify-center gap-2"
          >
            {sendingReminder ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Sending...
              </span>
            ) : (
              <>
                <MessageCircle size={16} /> WhatsApp
              </>
            )}
          </button>
        )}
      </motion.div>

      {/* ---- Transaction History ---- */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-3"
      >
        <h2 className="text-base font-semibold text-slate-900">
          Transaction History ({customer.transactions?.length || 0})
        </h2>

        {customer.transactions?.length === 0 ? (
          <div className="card-touch text-center py-8">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <IndianRupee size={20} className="text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-600">No transactions yet</p>
            <p className="text-xs text-slate-400 mt-1">Add your first entry to start tracking</p>
            <Link
              href={`/transactions/new?customerId=${customer.id}`}
              className="btn-primary mt-4 !text-sm !py-2 !min-h-0"
            >
              <IndianRupee size={14} className="mr-1" /> Add Entry
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {customer.transactions.map((txn: Transaction, i: number) => (
              <motion.div
                key={txn.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.03 }}
                className="card-touch flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      txn.type === 'CREDIT' ? 'bg-indigo-100' : 'bg-emerald-100'
                    }`}
                  >
                    <IndianRupee
                      size={16}
                      className={txn.type === 'CREDIT' ? 'text-indigo-600' : 'text-emerald-600'}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {getTypeLabel(txn.type)}
                    </p>
                    {txn.description && (
                      <p className="text-xs text-slate-400 truncate max-w-[180px]">
                        {txn.description}
                      </p>
                    )}
                    <p className="text-2xs text-slate-400">{formatRelativeTime(txn.createdAt)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-bold ${
                      txn.type === 'CREDIT' ? 'text-indigo-600' : 'text-emerald-600'
                    }`}
                  >
                    {formatCurrency(txn.amount)}
                  </p>
                  <span className={`chip text-2xs mt-1 ${getStatusColor(txn.status)}`}>
                    {txn.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* ---- Delete Confirmation Sheet ---- */}
      {showDeleteConfirm && (
        <>
          <div
            className="sheet-overlay"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="sheet p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Remove Customer?</h3>
            <p className="text-sm text-slate-500">
              This will hide {customer.name} from your list. The transaction history will be preserved.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary flex-1 !text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteMutation.mutate();
                  setShowDeleteConfirm(false);
                }}
                disabled={deleteMutation.isPending}
                className="btn-danger flex-1 !text-sm"
              >
                {deleteMutation.isPending ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}