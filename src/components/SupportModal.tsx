import React, { useState } from 'react';
import { Mail, CheckCircle2, Send, X } from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('manager@store.com');
  const [subject, setSubject] = useState('Urgent Staff Shortage Assistance');
  const [category, setCategory] = useState('Contract Staff Dispatch');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
    setTimeout(() => {
      // Auto close after 2.5s or user can close
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-slate-800" />
            <h3 className="text-sm font-semibold text-slate-900">
              ShiftFlow Manager Support
            </h3>
          </div>
          <button
            onClick={() => {
              setIsSent(false);
              onClose();
            }}
            className="p-1 rounded-md text-neutral-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSent ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="font-semibold text-slate-900 text-sm">
              Inquiry Dispatched to Support Team
            </h4>
            <p className="text-xs text-neutral-600 max-w-xs mx-auto">
              Our scheduling operations desk responds to managerial inquiries within 15 minutes during active shift hours.
            </p>
            <button
              onClick={() => {
                setIsSent(false);
                onClose();
              }}
              className="mt-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors"
            >
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Your Contact Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Topic Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  <option value="Contract Staff Dispatch">Contract Relievers</option>
                  <option value="Auto-Scheduler Assistance">Auto-Scheduler</option>
                  <option value="Labor & Overtime Rules">Labor Compliance</option>
                  <option value="Billing & Invoicing">Billing</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Priority
                </label>
                <select className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-900">
                  <option value="urgent">Urgent (&lt; 1 hr)</option>
                  <option value="today">Standard Today</option>
                  <option value="general">General Question</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Message / Store Context
              </label>
              <textarea
                rows={3}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe the shift issue, required role, or roster question..."
                className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Email</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
