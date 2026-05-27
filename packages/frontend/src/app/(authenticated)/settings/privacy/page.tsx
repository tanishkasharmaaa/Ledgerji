'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Lock, Eye, FileText } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="p-4 space-y-5 max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <Link href="/settings" className="p-1.5 -ml-1.5 rounded-lg hover:bg-slate-100">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <div className="flex items-center gap-2">
          <Shield size={20} className="text-primary-600" />
          <h1 className="text-lg font-bold text-slate-900">Privacy Policy</h1>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="card-touch space-y-4 text-sm text-slate-600 leading-relaxed"
      >
        <p className="text-slate-400 text-xs">Last updated: May 2025</p>

        <section>
          <h2 className="flex items-center gap-1.5 text-base font-semibold text-slate-800 mb-2">
            <Lock size={14} className="text-primary-500" />
            Your Data Stays Yours
          </h2>
          <p>
            LedgerJi stores your data securely in your own database. We do not sell, share,
            or use your business data for any purpose other than providing you the service.
          </p>
        </section>

        <section>
          <h2 className="flex items-center gap-1.5 text-base font-semibold text-slate-800 mb-2">
            <FileText size={14} className="text-primary-500" />
            What We Store
          </h2>
          <ul className="list-disc pl-4 space-y-1">
            <li>Your name, email, phone number, and business name</li>
            <li>Customer contact details you add</li>
            <li>Transaction records (amounts, dates, types)</li>
            <li>Reminder history (when and to whom)</li>
          </ul>
        </section>

        <section>
          <h2 className="flex items-center gap-1.5 text-base font-semibold text-slate-800 mb-2">
            <Eye size={14} className="text-primary-500" />
            What We Don't Store
          </h2>
          <ul className="list-disc pl-4 space-y-1">
            <li>Passwords (securely hashed)</li>
            <li>Payment information (UPI handles transactions, we don't see them)</li>
            <li>Location data</li>
            <li>Device fingerprinting or tracking data</li>
          </ul>
        </section>

        <section>
          <h2 className="flex items-center gap-1.5 text-base font-semibold text-slate-800 mb-2">
            <Shield size={14} className="text-primary-500" />
            Security
          </h2>
          <p>
            All data is transmitted over HTTPS. Authentication uses secure JWT tokens.
            Your database is hosted with enterprise-grade security.
          </p>
        </section>

        <p className="text-xs text-slate-400 pt-2">
          For questions, contact us at privacy@ledgerji.com
        </p>
      </motion.div>
    </div>
  );
}