'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { ArrowLeft, IndianRupee, User, Search, ChevronDown, FileText } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function NewTransactionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const preselectedCustomerId = searchParams.get('customerId');

  const [form, setForm] = useState({
    customerId: preselectedCustomerId || '',
    type: 'CREDIT' as 'CREDIT' | 'DEBIT',
    amount: '',
    description: '',
    status: 'PENDING' as 'PENDING' | 'PAID' | 'CANCELLED',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);
  const customerPickerRef = useRef<HTMLDivElement>(null);

  const { data: customersData } = useQuery<{ customers: any[] }>({
    queryKey: ['customers', customerSearch],
    queryFn: () => api.get('/customers', customerSearch ? { search: customerSearch, limit: '10' } : { limit: '10' }),
    enabled: showCustomerPicker,
  });

  const { data: preselectedCustomer } = useQuery<{ customer: any }>({
    queryKey: ['customer', preselectedCustomerId],
    queryFn: () => api.get(`/customers/${preselectedCustomerId}`),
    enabled: !!preselectedCustomerId,
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) =>
      api.post('/transactions', {
        ...data,
        amount: parseFloat(data.amount),
      }),
    onSuccess: (data: any) => {
      toast.success('Entry added! 📝');
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      if (data.transaction?.customerId) {
        queryClient.invalidateQueries({ queryKey: ['customer', data.transaction.customerId] });
      }
      router.push('/transactions');
    },
    onError: (err: any) => {
      if (err.errors) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((e: any) => {
          fieldErrors[e.field] = e.message;
        });
        setErrors(fieldErrors);
      }
      toast.error(err.message || 'Failed to add entry');
    },
  });

  const selectedCustomer = customersData?.customers?.find((c: any) => c.id === form.customerId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};

    if (!form.customerId) newErrors.customerId = 'Select a customer';
    if (!form.amount || isNaN(parseFloat(form.amount)) || parseFloat(form.amount) <= 0) {
      newErrors.amount = 'Enter a valid amount';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    createMutation.mutate(form);
  };

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Quick amount buttons
  const quickAmounts = [100, 500, 1000, 2000, 5000];

  return (
    <div className="p-4 space-y-5 max-w-lg mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 rounded-lg hover:bg-slate-100"
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-slate-900">New Entry</h1>
      </motion.div>

      {/* Type Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex bg-slate-100 rounded-xl p-1"
      >
        <button
          type="button"
          onClick={() => updateField('type', 'CREDIT')}
          className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all ${
            form.type === 'CREDIT'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-500'
          }`}
        >
          Money Given
        </button>
        <button
          type="button"
          onClick={() => updateField('type', 'DEBIT')}
          className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all ${
            form.type === 'DEBIT'
              ? 'bg-white text-emerald-600 shadow-sm'
              : 'text-slate-500'
          }`}
        >
          Money Received
        </button>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {/* Customer Select */}
        <div ref={customerPickerRef}>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
            <User size={16} className="text-slate-400" />
            Customer <span className="text-red-500">*</span>
          </label>

          {preselectedCustomer?.customer ? (
            <div className="input-touch flex items-center gap-3 bg-slate-50">
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {preselectedCustomer.customer.name.charAt(0)}
              </div>
              <span className="text-sm font-medium text-slate-900">
                {preselectedCustomer.customer.name}
              </span>
              <button
                type="button"
                onClick={() => updateField('customerId', '')}
                className="ml-auto text-xs text-slate-400 hover:text-red-500"
              >
                Change
              </button>
            </div>
          ) : (
            <>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={form.customerId && selectedCustomer ? selectedCustomer.name : customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    setShowCustomerPicker(true);
                  }}
                  onFocus={() => setShowCustomerPicker(true)}
                  placeholder="Search customer..."
                  className={`input-touch pl-10 ${errors.customerId ? 'border-red-400' : ''}`}
                />
              </div>

              {showCustomerPicker && customersData?.customers && (
                <div className="mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                  {customersData.customers.map((customer: any) => (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={() => {
                        updateField('customerId', customer.id);
                        setCustomerSearch('');
                        setShowCustomerPicker(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {customer.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{customer.name}</p>
                        {customer.phone && <p className="text-xs text-slate-400">{customer.phone}</p>}
                      </div>
                      {customer.balance > 0 && (
                        <span className="text-xs font-semibold text-red-500 ml-auto">
                          ₹{customer.balance}
                        </span>
                      )}
                    </button>
                  ))}
                  {customersData.customers.length === 0 && (
                    <p className="px-4 py-3 text-sm text-slate-400 text-center">
                      No customers found
                    </p>
                  )}
                </div>
              )}
            </>
          )}
          {errors.customerId && <p className="text-xs text-red-500 mt-1">{errors.customerId}</p>}
        </div>

        {/* Amount */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
            <IndianRupee size={16} className="text-slate-400" />
            Amount (₹) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={form.amount}
            onChange={(e) => updateField('amount', e.target.value)}
            placeholder="0"
            className={`input-touch text-xl font-bold ${errors.amount ? 'border-red-400' : ''}`}
          />
          {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}

          {/* Quick Amounts */}
          <div className="flex gap-2 mt-2 flex-wrap">
            {quickAmounts.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => updateField('amount', amt.toString())}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  form.amount === amt.toString()
                    ? 'bg-primary-50 border-primary-300 text-primary-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                ₹{amt}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
            <FileText size={16} className="text-slate-400" />
            Note (optional)
          </label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="What was this for?"
            className="input-touch"
          />
        </div>

        {/* Status */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1.5 block">
            Payment Status
          </label>
          <div className="flex bg-slate-100 rounded-xl p-1">
            {(['PENDING', 'PAID'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => updateField('status', status)}
                className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all ${
                  form.status === status
                    ? 'bg-white shadow-sm ' + (status === 'PENDING' ? 'text-amber-600' : 'text-emerald-600')
                    : 'text-slate-500'
                }`}
              >
                {status === 'PENDING' ? 'Pending' : 'Paid'}
              </button>
            ))}
          </div>
        </div>

        {/* Balance Info */}
        {selectedCustomer && (
          <div className="card-touch bg-slate-50 flex items-center justify-between">
            <p className="text-sm text-slate-500">Current Balance</p>
            <p className={`text-lg font-bold ${selectedCustomer.balance > 0 ? 'text-red-600' : selectedCustomer.balance < 0 ? 'text-emerald-600' : 'text-slate-600'}`}>
              ₹{Math.abs(selectedCustomer.balance).toLocaleString('en-IN')}
              <span className="text-xs font-normal ml-1">
                {selectedCustomer.balance > 0 ? 'to receive' : selectedCustomer.balance < 0 ? 'to return' : 'settled'}
              </span>
            </p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={createMutation.isPending}
          className={`w-full !py-4 flex items-center justify-center gap-2 rounded-xl font-semibold text-base transition-all active:scale-95 ${
            form.type === 'CREDIT'
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200'
              : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-200'
          }`}
        >
          {createMutation.isPending ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Saving...
            </>
          ) : (
            <>
              <IndianRupee size={18} />
              {form.type === 'CREDIT' ? 'Record Money Given' : 'Record Money Received'}
            </>
          )}
        </button>
      </motion.form>
    </div>
  );
}