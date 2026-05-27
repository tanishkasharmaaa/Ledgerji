'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatCurrency, formatDate, formatRelativeTime, getStatusColor, getTypeLabel } from '@/lib/utils';
import { Search, Filter, IndianRupee, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function TransactionsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'CREDIT' | 'DEBIT'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'PAID' | 'CANCELLED'>('ALL');

  const { data, isLoading } = useQuery<{ transactions: any[] }>({
    queryKey: ['transactions', typeFilter, statusFilter],
    queryFn: () => {
      const params: Record<string, string> = {};
      if (typeFilter !== 'ALL') params.type = typeFilter;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      return api.get('/transactions', params);
    },
  });

  const transactions = data?.transactions || [];

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h1 className="text-xl font-bold text-slate-900">Transactions</h1>
        <Link href="/transactions/new" className="btn-primary !px-4 !py-2 !text-sm !min-h-0">
          <IndianRupee size={16} className="mr-1" /> New
        </Link>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search transactions..."
          className="input-touch pl-10"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {/* Type Filter */}
        <div className="relative">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="appearance-none bg-white border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:border-primary-500"
          >
            <option value="ALL">All Types</option>
            <option value="CREDIT">Money Given</option>
            <option value="DEBIT">Money Received</option>
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="appearance-none bg-white border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:border-primary-500"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton h-20 rounded-2xl" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="empty-state">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <IndianRupee size={28} className="text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium">No transactions found</p>
          <p className="text-slate-400 text-sm mt-1">Start by adding your first entry</p>
          <Link href="/transactions/new" className="btn-primary mt-4">
            <IndianRupee size={16} className="mr-1" /> Add Entry
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.map((txn: any, i: number) => (
            <motion.div
              key={txn.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="card-touch"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      txn.type === 'CREDIT' ? 'bg-indigo-100' : 'bg-emerald-100'
                    }`}
                  >
                    <IndianRupee
                      size={18}
                      className={txn.type === 'CREDIT' ? 'text-indigo-600' : 'text-emerald-600'}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {txn.customer?.name || 'Customer'} — {getTypeLabel(txn.type)}
                    </p>
                    {txn.description && (
                      <p className="text-xs text-slate-400 truncate">{txn.description}</p>
                    )}
                    <p className="text-2xs text-slate-400 mt-0.5">
                      {formatDate(txn.createdAt)} · {formatRelativeTime(txn.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
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
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}