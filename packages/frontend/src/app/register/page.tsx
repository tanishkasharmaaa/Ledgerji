'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth.store';
import { IndianRupee, ArrowRight, User, Mail, Lock, Phone, Store } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', businessName: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password,
        businessName: form.businessName || undefined,
      });
      toast.success('Account created! 🎉');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed. Please try again.');
    }
  };

  const updateField = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-12 bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-sm mx-auto w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-white shadow-md shadow-primary-100/50 border border-slate-100 overflow-hidden p-1">
                      <Image 
                        src="/ledgerji-var1.svg" 
                        alt="LedgerJi Logo"
                        width={44}
                        height={44}
                        className="w-90 h-90 object-contain"
                        priority
                      />
                    </div>
          <h1 className="text-2xl font-bold text-slate-900">Join LedgerJi</h1>
          <p className="text-slate-500 mt-1">Free forever for small businesses</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Create your account</h2>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Your Name *</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={form.name} onChange={updateField('name')} placeholder="Rajesh Kumar" className="input-touch pl-10" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email *</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="email" value={form.email} onChange={updateField('email')} placeholder="you@example.com" className="input-touch pl-10" required autoComplete="email" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone (optional)</label>
            <div className="relative">
              <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="tel" value={form.phone} onChange={updateField('phone')} placeholder="+91 9876543210" className="input-touch pl-10" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password *</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="password" value={form.password} onChange={updateField('password')} placeholder="Min 6 characters" className="input-touch pl-10" required autoComplete="new-password" minLength={6} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Business Name (optional)</label>
            <div className="relative">
              <Store size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={form.businessName} onChange={updateField('businessName')} placeholder="Sharma General Store" className="input-touch pl-10" />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2">
            {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Create Free Account <ArrowRight size={18} /></>}
          </button>

          <p className="text-xs text-slate-400 text-center">No credit card required. Free forever.</p>
        </form>

        <p className="text-center mt-6 text-slate-600">
          Already have an account?{' '}
          <Link href="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}