'use client';
// comment added
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  QrCode, Download, Share2, Copy, Check, IndianRupee,
  Users, Zap, Loader2, ArrowLeft, MessageCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth.store';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

interface QrResponse {
  upiUri: string;
  upiIntentUrl: string;
  qrDataUrl: string;
  amount: number;
  payee: string;
  shareText: string;
  note: string;
}

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

export default function PaymentsPage() {
  const { user } = useAuthStore();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [search, setSearch] = useState('');
  const [showCustomerPick, setShowCustomerPick] = useState(false);
  const [qrResult, setQrResult] = useState<QrResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: customersData } = useQuery({
    queryKey: ['customers', 'upi', search],
    queryFn: () => api.get<{ customers: any[] }>('/customers', { search, limit: '20' }),
    staleTime: 30_000,
  });

  const selectedCustomer = customersData?.customers?.find((c: any) => c.id === customerId);

  const handleGenerate = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsGenerating(true);
    try {
      const body: any = { amount: numAmount };
      if (note.trim()) body.note = note.trim();

      let res: QrResponse;
      if (customerId && selectedCustomer) {
        body.customerName = selectedCustomer.name;
        res = await api.post<QrResponse>('/upi/qr/customer', body);
      } else {
        res = await api.post<QrResponse>('/upi/qr', body);
      }

      setQrResult(res);
      toast.success('QR code generated!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate QR');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!qrResult) return;
    try {
      const numAmount = parseFloat(amount);
      const body: any = { amount: numAmount };
      if (note.trim()) body.note = note.trim();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || '/api'}/upi/qr/download`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(body),
        },
      );

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ledgerji-payment-qr.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('QR downloaded!');
    } catch {
      toast.error('Download failed');
    }
  };

  const handleCopyLink = async () => {
    if (!qrResult) return;
    try {
      await navigator.clipboard.writeText(qrResult.upiUri);
      setCopied(true);
      toast.success('Payment link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleShareWhatsApp = () => {
    if (!qrResult) return;
    const text = encodeURIComponent(qrResult.shareText);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleShare = async () => {
    if (!qrResult) return;
    if (navigator.share) {
      try {
        await navigator.share({ text: qrResult.shareText });
      } catch {}
    } else {
      await handleCopyLink();
    }
  };

  return (
    <div className="p-4 space-y-5 max-w-lg mx-auto">
      {/* ---- Header ---- */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-1">
          <QrCode size={20} className="text-primary-600" />
          <h1 className="text-lg font-bold text-slate-900">UPI QR Payment</h1>
        </div>
        <p className="text-sm text-slate-500">
          Generate a QR code your customers can scan to pay you via any UPI app
        </p>
      </motion.div>

      {/* ---- Amount Input ---- */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="card-touch"
      >
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Enter Amount
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <IndianRupee size={16} className="text-slate-400" />
          </div>
          <input
            type="number"
            inputMode="decimal"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full pl-9 pr-4 py-3.5 text-2xl font-bold bg-slate-50 border-2 border-slate-200 rounded-touch focus:border-primary-400 focus:bg-white focus:outline-none transition-colors"
          />
        </div>

        {/* Quick Amounts */}
        <div className="flex flex-wrap gap-2 mt-3">
          {QUICK_AMOUNTS.map((amt) => (
            <button
              key={amt}
              onClick={() => setAmount(amt.toString())}
              className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-colors ${
                amount === amt.toString()
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300 hover:text-primary-600'
              }`}
            >
              ₹{amt}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ---- Customer Selector ---- */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card-touch"
      >
        <button
          onClick={() => setShowCustomerPick(!showCustomerPick)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Users size={18} className="text-slate-400" />
            <span className="text-sm font-medium text-slate-700">
              {selectedCustomer ? selectedCustomer.name : 'Select Customer (optional)'}
            </span>
          </div>
          <span className="text-xs text-slate-400">
            {showCustomerPick ? '▲' : '▼'}
          </span>
        </button>

        {showCustomerPick && (
          <div className="mt-3 space-y-2">
            <input
              type="text"
              placeholder="Search customers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-primary-400"
            />
            <div className="max-h-36 overflow-y-auto space-y-0.5">
              <button
                onClick={() => {
                  setCustomerId('');
                  setShowCustomerPick(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                  !customerId ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                None (general payment)
              </button>
              {customersData?.customers?.map((c: any) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setCustomerId(c.id);
                    setShowCustomerPick(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                    customerId === c.id
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {c.name}
                  {c.balance > 0 && (
                    <span className="ml-2 text-xs text-red-500">
                      owes ₹{c.balance}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* ---- Note ---- */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="card-touch"
      >
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Note (optional)
        </label>
        <input
          type="text"
          placeholder="e.g., Payment for January supplies"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full px-4 py-3 text-sm border border-slate-200 rounded-touch focus:outline-none focus:border-primary-400"
        />
      </motion.div>

      {/* ---- Generate Button ---- */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !amount}
          className="btn-primary-touch w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Zap size={18} />
              Generate QR Code
            </>
          )}
        </button>
      </motion.div>

      {/* ---- QR Result ---- */}
      <AnimatePresence>
        {qrResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-4"
          >
            {/* QR Card */}
            <div className="card-touch flex flex-col items-center py-6">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrResult.qrDataUrl}
                  alt="UPI Payment QR Code"
                  className="w-56 h-56"
                />
              </div>

              <p className="text-2xl font-extrabold text-slate-900">
                {formatCurrency(qrResult.amount)}
              </p>
              <p className="text-sm text-slate-500 mt-0.5">
                Pay to: <span className="font-medium text-slate-700">{qrResult.payee}</span>
              </p>
              {qrResult.note && (
                <p className="text-xs text-slate-400 mt-1">"{qrResult.note}"</p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-5">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
                >
                  <Download size={16} />
                  Save
                </button>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
                >
                  {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
                >
                  <Share2 size={16} />
                  Share
                </button>
              </div>

              <button
                onClick={handleShareWhatsApp}
                className="mt-3 flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-full hover:bg-green-700 transition-colors"
              >
                <MessageCircle size={16} />
                Share on WhatsApp
              </button>
            </div>

            {/* Payment Link Section */}
            <div className="card-touch">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Payment Link</h3>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-600 break-all font-mono">
                  {qrResult.upiUri}
                </p>
                <button
                  onClick={handleCopyLink}
                  className="mt-2 flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy link'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- UPI ID Info ---- */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center pb-6"
      >
        <p className="text-xs text-slate-400">
          Customers can scan this QR with any UPI app (Google Pay, PhonePe, Paytm, BHIM)
        </p>
        {user?.upiId && (
          <p className="text-xs text-slate-500 mt-1">
            Your UPI ID: <span className="font-mono">{user.upiId}</span>
          </p>
        )}
      </motion.div>
    </div>
  );
}