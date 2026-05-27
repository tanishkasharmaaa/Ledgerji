'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { ArrowLeft, Save, Loader2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

export default function EditCustomerPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const customerId = params.id as string;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => api.get<{ customer: any }>(`/customers/${customerId}`),
    enabled: !!customerId,
  });

  useEffect(() => {
    if (customer?.customer) {
      const c = customer.customer;
      setName(c.name || '');
      setPhone(c.phone || '');
      setWhatsappPhone(c.whatsappPhone || '');
      setEmail(c.email || '');
      setAddress(c.address || '');
      setNotes(c.notes || '');
    }
  }, [customer]);

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, any>) =>
      api.patch(`/customers/${customerId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer updated!');
      router.push(`/customers/${customerId}`);
    },
    onError: (err: any) => {
      if (err.errors) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((e: any) => { fieldErrors[e.field] = e.message; });
        setErrors(fieldErrors);
      }
      toast.error(err.message || 'Failed to update customer');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/customers/${customerId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer deleted');
      router.push('/customers');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete customer');
    },
  });

  // Helper: clean a phone number by stripping +91, spaces, dashes
  const cleanPhone = (raw: string): string => {
    let cleaned = raw.replace(/[\s\-\(\)]/g, ''); // strip spaces, dashes, parens
    // Strip optional +91 / 91 / + prefix
    cleaned = cleaned.replace(/^(\+?91[- ]?|0)/, '');
    return cleaned;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';

    // Validate phone (10 digits, optional, with or without country code)
    const cleanedPhone = phone.trim() ? cleanPhone(phone) : '';
    if (cleanedPhone && !/^[6-9]\d{9}$/.test(cleanedPhone)) {
      newErrors.phone = 'Enter a valid 10-digit phone number';
    }

    // Validate WhatsApp phone (10 digits, optional)
    const cleanedWhatsappPhone = whatsappPhone.trim() ? cleanPhone(whatsappPhone) : '';
    if (cleanedWhatsappPhone && !/^[6-9]\d{9}$/.test(cleanedWhatsappPhone)) {
      newErrors.whatsappPhone = 'Enter a valid 10-digit phone number';
    }

    // Validate email (optional)
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const data: Record<string, any> = { name: name.trim() };
    if (cleanedPhone) data.phone = cleanedPhone;
    if (cleanedWhatsappPhone) data.whatsappPhone = cleanedWhatsappPhone;
    if (email.trim()) data.email = email.trim();
    if (address.trim()) data.address = address.trim();
    if (notes.trim()) data.notes = notes.trim();

    updateMutation.mutate(data);
  };

  const handleDelete = () => {
    if (!confirm('Are you sure you want to delete this customer? This cannot be undone.')) return;
    deleteMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="p-4 max-w-lg mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 bg-slate-200 rounded" />
          <div className="h-12 w-full bg-slate-200 rounded-touch" />
          <div className="h-12 w-full bg-slate-200 rounded-touch" />
          <div className="h-12 w-full bg-slate-200 rounded-touch" />
        </div>
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
          <Link href={`/customers/${customerId}`} className="p-1.5 -ml-1.5 rounded-lg hover:bg-slate-100">
            <ArrowLeft size={20} className="text-slate-600" />
          </Link>
          <h1 className="text-lg font-bold text-slate-900">Edit Customer</h1>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete customer"
        >
          {deleteMutation.isPending ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Trash2 size={18} />
          )}
        </button>
      </motion.div>

      {/* ---- Form ---- */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Customer's full name"
            className={`w-full px-4 py-3 text-base border rounded-touch focus:outline-none transition-colors ${
              errors.name
                ? 'border-red-300 focus:border-red-500 bg-red-50'
                : 'border-slate-200 focus:border-primary-400'
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500">{errors.name}</p>
          )}
        </motion.div>

        {/* Phone */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            className={`w-full px-4 py-3 text-base border rounded-touch focus:outline-none transition-colors ${
              errors.phone
                ? 'border-red-300 focus:border-red-500 bg-red-50'
                : 'border-slate-200 focus:border-primary-400'
            }`}
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
          )}
        </motion.div>

        {/* WhatsApp Phone */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            WhatsApp Number
          </label>
          <input
            type="tel"
            value={whatsappPhone}
            onChange={(e) => setWhatsappPhone(e.target.value)}
            placeholder="Same as phone if not different"
            className={`w-full px-4 py-3 text-base border rounded-touch focus:outline-none transition-colors ${
              errors.whatsappPhone
                ? 'border-red-300 focus:border-red-500 bg-red-50'
                : 'border-slate-200 focus:border-primary-400'
            }`}
          />
          {errors.whatsappPhone && (
            <p className="mt-1 text-xs text-red-500">{errors.whatsappPhone}</p>
          )}
          <p className="mt-1 text-xs text-slate-400">
            Reminders will be sent to this number via WhatsApp
          </p>
        </motion.div>

        {/* Email */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="customer@example.com"
            className={`w-full px-4 py-3 text-base border rounded-touch focus:outline-none transition-colors ${
              errors.email
                ? 'border-red-300 focus:border-red-500 bg-red-50'
                : 'border-slate-200 focus:border-primary-400'
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email}</p>
          )}
        </motion.div>

        {/* Address */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Shop no., street, area, city"
            rows={2}
            className="w-full px-4 py-3 text-base border border-slate-200 rounded-touch focus:outline-none focus:border-primary-400 transition-colors resize-none"
          />
        </motion.div>

        {/* Notes */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any extra info about this customer"
            rows={2}
            className="w-full px-4 py-3 text-base border border-slate-200 rounded-touch focus:outline-none focus:border-primary-400 transition-colors resize-none"
          />
        </motion.div>

        {/* Submit */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="btn-primary-touch w-full"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </motion.div>
      </form>
    </div>
  );
}