'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { Bell, Send, MessageCircle, IndianRupee, ChevronDown, User, Users } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function RemindersPage() {
  const queryClient = useQueryClient();
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('friendly');
  const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);
  const [customMessage, setCustomMessage] = useState('');

  // Fetch customers with pending balances
  const { data: customersData } = useQuery<{ customers: any[] }>({
    queryKey: ['customers-pending'],
    queryFn: () => api.get('/customers', { limit: '50' }),
  });

  // Fetch reminder history
  const { data: remindersData, isLoading: remindersLoading } = useQuery<{ reminders: any[] }>({
    queryKey: ['reminders'],
    queryFn: () => api.get('/reminders', { limit: '30' }),
  });

  // Fetch templates
  const { data: templatesData } = useQuery<{ templates: any[] }>({
    queryKey: ['reminder-templates'],
    queryFn: () => api.get('/reminders/templates'),
  });

  const sendReminderMutation = useMutation({
    mutationFn: (customerId: string) =>
      api.post('/reminders', {
        customerId,
        template: selectedTemplate,
        customMessage: customMessage.trim() || undefined,
      }),
    onSuccess: (data: any) => {
      if (data.whatsappUrl) {
        window.open(data.whatsappUrl, '_blank');
        toast.success('WhatsApp opened! 📱');
      }
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to send reminder');
    },
  });

  const handleSendReminder = (customerId: string) => {
    setSendingReminderId(customerId);
    sendReminderMutation.mutate(customerId);
    setTimeout(() => setSendingReminderId(null), 2000);
  };

  const customersWithBalance = customersData?.customers?.filter((c: any) => c.balance > 0) || [];
  const reminders = remindersData?.reminders || [];
  const templates = templatesData?.templates || [];

  const selectedCustomer = customersData?.customers?.find((c: any) => c.id === selectedCustomerId);

  return (
    <div className="p-4 space-y-5 max-w-lg mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-xl font-bold text-slate-900">Payment Reminders</h1>
        <p className="text-sm text-slate-500">Send friendly reminders via WhatsApp</p>
      </motion.div>

      {/* Send Reminder Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="card-touch space-y-3"
      >
        <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <Send size={18} className="text-amber-500" />
          Send Reminder
        </h2>

        {/* Select Customer */}
        {!selectedCustomer ? (
          <div className="relative">
            <button
              onClick={() => setShowCustomerPicker(!showCustomerPicker)}
              className="input-touch flex items-center justify-between text-left"
            >
              <span className={selectedCustomerId ? 'text-slate-900' : 'text-slate-400'}>
                <User size={16} className="inline mr-2" />
                {selectedCustomerId ? selectedCustomer?.name : 'Select a customer with pending balance'}
              </span>
              <ChevronDown size={18} className={`transition-transform ${showCustomerPicker ? 'rotate-180' : ''}`} />
            </button>

            {showCustomerPicker && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-10 max-h-48 overflow-y-auto">
                {customersWithBalance.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-slate-400 text-center">
                    No customers with pending balance! 🎉
                  </p>
                ) : (
                  customersWithBalance.map((customer: any) => (
                    <button
                      key={customer.id}
                      onClick={() => {
                        setSelectedCustomerId(customer.id);
                        setShowCustomerPicker(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">
                          {customer.name.charAt(0)}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-slate-900">{customer.name}</p>
                          {customer.phone && <p className="text-xs text-slate-400">{customer.phone}</p>}
                        </div>
                      </div>
                      <span className="text-sm font-bold text-red-600">
                        {formatCurrency(customer.balance)}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="input-touch flex items-center gap-3 bg-slate-50 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {selectedCustomer.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">{selectedCustomer.name}</p>
                <p className="text-xs text-red-500 font-semibold">Pending: {formatCurrency(selectedCustomer.balance)}</p>
              </div>
              <button
                onClick={() => setSelectedCustomerId('')}
                className="ml-auto text-xs text-slate-400 hover:text-red-500"
              >
                Change
              </button>
            </div>

            {/* Template Selector */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500">Message Style</p>
              <div className="flex gap-2">
                {templates.map((tpl: any) => (
                  <button
                    key={tpl.id}
                    onClick={() => setSelectedTemplate(tpl.id)}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      selectedTemplate === tpl.id
                        ? 'border-amber-400 bg-amber-50 text-amber-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {tpl.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Message */}
            <div className="mt-3">
              <label className="text-xs font-medium text-slate-500 mb-1 block">Optional Custom Message</label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Add a personal note to the reminder..."
                rows={2}
                className="input-touch w-full text-sm resize-none"
                maxLength={500}
              />
              <p className="text-2xs text-slate-400 mt-1 text-right">{customMessage.length}/500</p>
            </div>

            {/* Preview */}
            <div className="mt-3 p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <MessageCircle size={14} className="text-emerald-600" />
                <span className="text-2xs font-medium text-emerald-600">WhatsApp Preview</span>
              </div>
              <p className="text-xs text-slate-600 whitespace-pre-line line-clamp-4">
                {templates.find((t: any) => t.id === selectedTemplate)?.preview || 'Loading...'}
              </p>
            </div>

            {/* Send Button */}
            <button
              onClick={() => handleSendReminder(selectedCustomer.id)}
              disabled={sendingReminderId === selectedCustomer.id}
              className="btn-touch !py-3 !text-sm bg-amber-500 text-white hover:bg-amber-600 shadow-sm shadow-amber-200 w-full mt-3 flex items-center justify-center gap-2"
            >
              {sendingReminderId === selectedCustomer.id ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Opening WhatsApp...
                </>
              ) : (
                <>
                  <MessageCircle size={16} /> Send via WhatsApp
                </>
              )}
            </button>
          </div>
        )}
      </motion.div>

      {/* Quick Send: All Pending Customers */}
      {customersWithBalance.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Users size={18} className="text-slate-500" />
            Customers with Pending ({customersWithBalance.length})
          </h2>

          <div className="space-y-2">
            {customersWithBalance.map((customer: any, i: number) => (
              <motion.div
                key={customer.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.03 }}
                className="card-touch flex items-center justify-between"
              >
                <Link
                  href={`/customers/${customer.id}`}
                  className="flex items-center gap-3 flex-1 min-w-0"
                >
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
                    {customer.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{customer.name}</p>
                    {customer.phone && <p className="text-xs text-slate-400">{customer.phone}</p>}
                  </div>
                </Link>
                <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                  <span className="text-sm font-bold text-red-600">{formatCurrency(customer.balance)}</span>
                  <button
                    onClick={() => handleSendReminder(customer.id)}
                    disabled={sendingReminderId === customer.id}
                    className="px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-semibold hover:bg-amber-600 active:scale-95 transition-all flex-shrink-0"
                  >
                    {sendingReminderId === customer.id ? (
                      <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                    ) : (
                      <Send size={14} />
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Reminder History */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-3"
      >
        <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <Bell size={18} className="text-slate-500" />
          Reminder History
        </h2>

        {remindersLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-16 rounded-2xl" />
            ))}
          </div>
        ) : reminders.length === 0 ? (
          <div className="card-touch text-center py-8">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Bell size={20} className="text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-600">No reminders sent yet</p>
            <p className="text-xs text-slate-400 mt-1">Reminders you send will appear here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {reminders.map((reminder: any, i: number) => (
              <motion.div
                key={reminder.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.03 }}
                className="card-touch"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center">
                      <MessageCircle size={16} className="text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {reminder.customer?.name || 'Customer'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {reminder.template} · {reminder.status}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xs text-slate-400">{formatRelativeTime(reminder.sentAt)}</p>
                    <button
                      onClick={() => {
                        if (reminder.whatsappNumber) {
                          const msg = encodeURIComponent(reminder.message || 'Reminder from LedgerJi');
                          window.open(`https://wa.me/${reminder.whatsappNumber}?text=${msg}`, '_blank');
                        }
                      }}
                      className="text-xs text-emerald-600 font-medium mt-1 hover:underline"
                    >
                      Resend
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}