'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Search, Plus, Phone, MessageCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function CustomersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery<{ customers: any[] }>({
    queryKey: ['customers', search],
    queryFn: () => api.get('/customers', search ? { search } : undefined),
  });

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Customers</h1>
        <Link href="/customers/new" className="btn-primary !px-4 !py-2 !text-sm !min-h-0">
          <Plus size={16} className="mr-1" /> Add
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers..."
          className="input-touch pl-10"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton h-20 rounded-2xl" />
          ))}
        </div>
      ) : data?.customers?.length === 0 ? (
        <div className="empty-state">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <UsersIcon size={28} className="text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium">No customers yet</p>
          <p className="text-slate-400 text-sm mt-1">Add your first customer to start tracking</p>
          <Link href="/customers/new" className="btn-primary mt-4">
            <Plus size={16} className="mr-1" /> Add Customer
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {data?.customers?.map((customer: any, i: number) => (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Link href={`/customers/${customer.id}`} className="card-touch flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {customer.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{customer.name}</p>
                    {customer.phone && (
                      <p className="text-xs text-slate-400">{customer.phone}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {customer.balance > 0 && (
                    <span className="text-sm font-bold text-red-600">{formatCurrency(customer.balance)}</span>
                  )}
                  {customer.balance === 0 && (
                    <span className="chip-paid text-2xs">Paid</span>
                  )}
                  <ChevronRight size={16} className="text-slate-300" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function UsersIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}