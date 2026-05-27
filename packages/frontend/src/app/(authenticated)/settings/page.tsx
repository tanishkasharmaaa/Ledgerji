'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import api from '@/lib/api';
import { getInitials } from '@/lib/utils';
import {
  ArrowLeft, User, Mail, Phone, Building2, IndianRupee,
  LogOut, Save, Shield, Globe, Heart,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, logout, setUser } = useAuthStore();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    upiId: '',
  });
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        businessName: user.businessName || '',
        upiId: user.upiId || '',
      });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: (data: typeof form) => api.patch('/auth/me', data),
    onSuccess: (data: any) => {
      if (data.user) {
        setUser(data.user);
      }
      toast.success('Profile updated! ✅');
      setIsDirty(false);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update profile');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(form);
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

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
        <h1 className="text-xl font-bold text-slate-900">Settings</h1>
      </motion.div>

      {/* Profile Avatar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center py-6"
      >
        <div className="w-20 h-20 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-2xl font-bold mb-3 ring-4 ring-primary-50">
          {user?.name ? getInitials(user.name) : '?'}
        </div>
        <p className="text-lg font-bold text-slate-900">{user?.name}</p>
        <p className="text-sm text-slate-500">{user?.email}</p>
        <p className="text-xs text-slate-400 mt-1">
          {user?.businessName ? user.businessName : 'Personal Account'}
        </p>
      </motion.div>

      {/* Edit Profile Form */}
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <h2 className="text-base font-semibold text-slate-900">Profile</h2>

        {/* Name */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
            <User size={16} className="text-slate-400" />
            Your Name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            className="input-touch"
          />
        </div>

        {/* Email */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
            <Mail size={16} className="text-slate-400" />
            Email
          </label>
          <input
            type="email"
            value={form.email}
            disabled
            className="input-touch bg-slate-50 text-slate-400 cursor-not-allowed"
          />
          <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
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

        {/* Business Name */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
            <Building2 size={16} className="text-slate-400" />
            Business Name
          </label>
          <input
            type="text"
            value={form.businessName}
            onChange={(e) => updateField('businessName', e.target.value)}
            placeholder="Your shop or business name"
            className="input-touch"
          />
        </div>

        {/* UPI ID */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
            <IndianRupee size={16} className="text-slate-400" />
            Your UPI ID
          </label>
          <input
            type="text"
            value={form.upiId}
            onChange={(e) => updateField('upiId', e.target.value)}
            placeholder="yourname@upi"
            className="input-touch"
          />
          <p className="text-xs text-slate-400 mt-1">
            Used in payment links & QR codes. If empty, a default will be used.
          </p>
        </div>

        {/* Save Button */}
        {isDirty && (
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="btn-primary w-full !py-4 flex items-center justify-center gap-2"
          >
            {updateMutation.isPending ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Saving...
              </>
            ) : (
              <>
                <Save size={18} /> Save Changes
              </>
            )}
          </button>
        )}
      </motion.form>

      {/* Links */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-1"
      >
        <h2 className="text-base font-semibold text-slate-900 mb-2">More</h2>

        <Link
          href="/settings/privacy"
          className="card-touch flex items-center gap-3"
        >
          <Shield size={20} className="text-slate-400" />
          <span className="text-sm text-slate-700 font-medium">Privacy & Security</span>
        </Link>

        <Link
          href="/settings/about"
          className="card-touch flex items-center gap-3"
        >
          <Globe size={20} className="text-slate-400" />
          <div>
            <span className="text-sm text-slate-700 font-medium">About LedgerJi</span>
            <p className="text-2xs text-slate-400 mt-0.5">Version 1.0.0 · Made with ❤️ in India</p>
          </div>
        </Link>
      </motion.div>

      {/* Logout */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <button
          onClick={handleLogout}
          className="btn-touch w-full !py-4 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl flex items-center justify-center gap-2"
        >
          <LogOut size={18} /> Logout
        </button>
      </motion.div>

      <p className="text-center text-xs text-slate-400 pb-4">
        <Heart size={10} className="inline text-red-400 mr-1" />
        LedgerJi · Simple Business Tracking
      </p>
    </div>
  );
}