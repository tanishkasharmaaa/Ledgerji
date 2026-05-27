'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { ArrowLeft, Plus, User, Phone, Mail, MapPin, MessageCircle, StickyNote } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function NewCustomerPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    whatsappPhone: '',
    address: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/customers', data),
    onSuccess: (data: any) => {
      toast.success('Customer added! 🎉');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      router.push(`/customers/${data.customer.id}`);
    },
    onError: (err: any) => {
      if (err.errors) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((e: any) => {
          fieldErrors[e.field] = e.message;
        });
        setErrors(fieldErrors);
      }
      toast.error(err.message || 'Failed to add customer');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!form.name.trim()) {
      setErrors({ name: 'Name is required' });
      return;
    }

    createMutation.mutate({
      ...form,
      whatsappPhone: form.whatsappPhone || form.phone,
    });
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <div className="p-4 space-y-5 max-w-lg mx-auto">
      {/* ---- Header ---- */}
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
        <h1 className="text-xl font-bold text-slate-900">New Customer</h1>
      </motion.div>

      {/* ---- Form ---- */}
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {/* Name */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
            <User size={16} className="text-slate-400" />
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Customer name"
            className={`input-touch ${errors.name ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : ''}`}
            autoFocus
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
            <Phone size={16} className="text-slate-400" />
            Phone Number
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            placeholder="+91 98765 43210"
            className="input-touch"
          />
        </div>

        {/* WhatsApp Phone */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
            <MessageCircle size={16} className="text-slate-400" />
            WhatsApp Number
          </label>
          <input
            type="tel"
            value={form.whatsappPhone}
            onChange={(e) => updateField('whatsappPhone', e.target.value)}
            placeholder="Same as phone if not specified"
            className="input-touch"
          />
          <p className="text-xs text-slate-400 mt-1">
            Leave empty to use phone number above
          </p>
        </div>

        {/* Email */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
            <Mail size={16} className="text-slate-400" />
            Email (optional)
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="customer@example.com"
            className="input-touch"
          />
        </div>

        {/* Address */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
            <MapPin size={16} className="text-slate-400" />
            Address (optional)
          </label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => updateField('address', e.target.value)}
            placeholder="Shop address"
            className="input-touch"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
            <StickyNote size={16} className="text-slate-400" />
            Notes (optional)
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            placeholder="Any extra information..."
            rows={3}
            className="input-touch resize-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="btn-primary w-full !py-4 flex items-center justify-center gap-2"
        >
          {createMutation.isPending ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Adding...
            </>
          ) : (
            <>
              <Plus size={18} /> Add Customer
            </>
          )}
        </button>
      </motion.form>

      <p className="text-center text-xs text-slate-400">
        Customers you add are private to your account
      </p>
    </div>
  );
}