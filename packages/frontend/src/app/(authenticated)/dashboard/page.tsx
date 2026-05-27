'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { formatCompactCurrency, formatCurrency, formatRelativeTime } from '@/lib/utils';
import {
  IndianRupee, TrendingUp, Users, Bell, ArrowRight,
  ArrowUpRight, Plus, Send, UserPlus, CreditCard,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface DashboardData {
  totalPendingMoney: number;
  todayCollection: number;
  monthCollection: number;
  collectionGrowth: number;
  totalCustomers: number;
  customersWithBalance: number;
  recentTransactions: any[];
  topDebtors: any[];
}

export default function DashboardPage() {
  const router = useRouter();
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/dashboard'),
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="p-4 space-y-4 animate-pulse">
        <div className="skeleton h-32 rounded-2xl" />
        <div className="grid grid-cols-2 gap-3">
          <div className="skeleton h-24 rounded-2xl" />
          <div className="skeleton h-24 rounded-2xl" />
        </div>
        <div className="skeleton h-48 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-5 max-w-lg mx-auto">
      {/* ---- Welcome ---- */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-slate-900">Good day! ☀️</h1>
        <p className="text-slate-500 text-sm">Here's your money overview</p>
      </motion.div>

      {/* ---- Main Metric: Total Pending ---- */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-5 text-white shadow-lg shadow-primary-200"
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-primary-100 text-sm font-medium">Money to Receive</p>
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <IndianRupee size={20} />
          </div>
        </div>
        <p className="text-3xl font-bold tracking-tight">{formatCurrency(data?.totalPendingMoney || 0)}</p>
        <p className="text-primary-200 text-sm mt-1">
          from {data?.customersWithBalance || 0} customer{(data?.customersWithBalance || 0) !== 1 ? 's' : ''}
        </p>
      </motion.div>

      {/* ---- Quick Stats Grid ---- */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="card-touch"
        >
          <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center mb-2">
            <TrendingUp size={18} className="text-emerald-600" />
          </div>
          <p className="text-xs text-slate-500 font-medium">Today's Collection</p>
          <p className="text-lg font-bold text-slate-900">{formatCompactCurrency(data?.todayCollection || 0)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="card-touch"
        >
          <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center mb-2">
            <Users size={18} className="text-indigo-600" />
          </div>
          <p className="text-xs text-slate-500 font-medium">Total Customers</p>
          <p className="text-lg font-bold text-slate-900">{data?.totalCustomers || 0}</p>
        </motion.div>
      </div>

      {/* ---- Quick Actions ---- */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Add Entry', icon: Plus, href: '/transactions/new', color: 'bg-primary-100 text-primary-700' },
          { label: 'Send Reminder', icon: Send, href: '/reminders', color: 'bg-amber-100 text-amber-700' },
          { label: 'Add Customer', icon: UserPlus, href: '/customers/new', color: 'bg-emerald-100 text-emerald-700' },
          { label: 'Payments', icon: CreditCard, href: '/transactions', color: 'bg-purple-100 text-purple-700' },
        ].map((action, i) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            <Link
              href={action.href}
              className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-xl border border-slate-100 active:scale-95 transition-transform"
            >
              <div className={`w-10 h-10 ${action.color} rounded-xl flex items-center justify-center`}>
                <action.icon size={18} />
              </div>
              <span className="text-2xs font-medium text-slate-600 text-center leading-tight">{action.label}</span>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* ---- Top Debtors ---- */}
      {data?.topDebtors && data.topDebtors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Top Pending</h2>
            <Link href="/customers" className="text-xs text-primary-600 font-medium flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          <div className="space-y-2">
            {data.topDebtors.map((customer: any, i: number) => (
              <Link
                key={customer.id}
                href={`/customers/${customer.id}`}
                className="card-touch flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                    {customer.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{customer.name}</p>
                    {customer.phone && <p className="text-xs text-slate-400">{customer.phone}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-600">{formatCurrency(customer.balance)}</p>
                  <ArrowUpRight size={14} className="text-red-400 ml-auto" />
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* ---- Recent Activity ---- */}
      {data?.recentTransactions && data.recentTransactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Recent Activity</h2>
            <Link href="/transactions" className="text-xs text-primary-600 font-medium flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          <div className="space-y-2">
            {data.recentTransactions.slice(0, 5).map((txn: any) => (
              <div key={txn.id} className="card-touch flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${txn.type === 'CREDIT' ? 'bg-indigo-100' : 'bg-emerald-100'}`}>
                    <IndianRupee size={14} className={txn.type === 'CREDIT' ? 'text-indigo-600' : 'text-emerald-600'} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {txn.customer?.name || 'Customer'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {txn.type === 'CREDIT' ? 'Money Given' : 'Money Received'} · {formatRelativeTime(txn.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${txn.type === 'CREDIT' ? 'text-indigo-600' : 'text-emerald-600'}`}>
                    {formatCurrency(txn.amount)}
                  </p>
                  {txn.status && (
                    <span className={`chip text-2xs ${txn.status === 'PAID' ? 'chip-paid' : txn.status === 'PENDING' ? 'chip-pending' : 'chip-cancelled'}`}>
                      {txn.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}