'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Info, Heart, IndianRupee, Zap } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
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
          <Info size={20} className="text-primary-600" />
          <h1 className="text-lg font-bold text-slate-900">About LedgerJi</h1>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="card-touch space-y-5 text-sm text-slate-600 leading-relaxed"
      >
        {/* Hero */}
        <div className="text-center py-3">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <IndianRupee size={28} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">LedgerJi</h2>
          <p className="text-sm text-slate-500 mt-1">
            Business bookkeeping made simpler than WhatsApp
          </p>
        </div>

        {/* Mission */}
        <section>
          <h3 className="flex items-center gap-1.5 text-base font-semibold text-slate-800 mb-2">
            <Zap size={14} className="text-primary-500" />
            Our Mission
          </h3>
          <p>
            We believe every small business owner in India deserves a simple way to track
            their money — without learning accounting, without expensive software, and
            without needing a computer. LedgerJi is built for the mobile-first world of
            Indian businesses.
          </p>
          <p className="mt-2">
            Whether you run a kirana store, a salon, a gym, a wholesale business, or
            freelance — LedgerJi works the way you think: "Who owes me money?" and
            "Who did I pay?"
          </p>
        </section>

        {/* Features */}
        <section>
          <h3 className="text-base font-semibold text-slate-800 mb-2">Key Features</h3>
          <ul className="space-y-2">
            <li className="flex gap-2">
              <span className="text-primary-500 mt-0.5">📱</span>
              <span>Works on any phone — no app install needed</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary-500 mt-0.5">💬</span>
              <span>Send payment reminders via WhatsApp in one tap</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary-500 mt-0.5">📷</span>
              <span>Generate UPI QR codes customers can scan to pay you</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary-500 mt-0.5">🔒</span>
              <span>Your data stays yours — private and secure</span>
            </li>
          </ul>
        </section>

        {/* Built with */}
        <section>
          <h3 className="flex items-center gap-1.5 text-base font-semibold text-slate-800 mb-2">
            <Heart size={14} className="text-red-500" />
            Built with Love in India 🇮🇳
          </h3>
          <p>
            LedgerJi is proudly built in India, for Indian businesses. We understand
            the unique needs of our local business community — from UPI payments to
            WhatsApp communication, from Hindi-friendly design to offline-first
            reliability.
          </p>
        </section>

        <p className="text-xs text-slate-400 text-center pt-2">
          Version 1.0.0 · Made with ❤️ for Indian businesses
        </p>
      </motion.div>
    </div>
  );
}