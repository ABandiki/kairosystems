'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, CheckCircle, AlertCircle, Calendar, Building2, User, Mail, Phone, MessageSquare } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface RequestDemoDialogProps {
  open: boolean;
  onClose: () => void;
}

export function RequestDemoDialog({ open, onClose }: RequestDemoDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    practiceName: '',
    practiceSize: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when dialog is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    try {
      const res = await fetch(`${API_BASE_URL}/demo-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus('success');
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.message || 'Something went wrong. Please try again.');
        setStatus('error');
      }
    } catch {
      setErrorMsg('Unable to connect. Please email ashley@kairo.clinic directly.');
      setStatus('error');
    }
  };

  const handleClose = () => {
    setStatus('idle');
    setFormData({ name: '', email: '', phone: '', practiceName: '', practiceSize: '', message: '' });
    onClose();
  };

  if (!open || !mounted) return null;

  const dialog = (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Centering wrapper */}
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Dialog */}
        <div
          className="relative w-full max-w-lg bg-[#0B0B0B] border border-white/10 rounded-2xl shadow-2xl text-white animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1A1A1A] rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#4CBD90]" />
                </div>
                <div>
                  <h2 className="text-lg font-medium tracking-tight text-white">Request a Demo</h2>
                  <p className="text-sm text-white/40">See Kairo in action for your practice</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>
          </div>

          {status === 'success' ? (
            /* Success state */
            <div className="px-6 py-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#03989E]/15 border border-[#03989E]/30 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-[#4CBD90]" />
              </div>
              <h3 className="text-xl font-medium tracking-tight text-white mb-2">Demo request received</h3>
              <p className="text-white/60 mb-2">
                Thank you, {formData.name.split(' ')[0]}! We've received your request.
              </p>
              <p className="text-sm text-white/40 mb-6">
                We'll get back to you within 24 hours to schedule your personalised demo.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleClose}
                  className="px-6 py-2.5 bg-white text-black text-sm font-semibold rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all"
                >
                  Done
                </button>
                <p className="text-xs text-white/30">
                  Or WhatsApp us at{' '}
                  <a href="https://wa.me/447863707798" target="_blank" rel="noopener noreferrer" className="text-[#4CBD90] underline">
                    +44 786 370 7798
                  </a>
                </p>
              </div>
            </div>
          ) : status === 'error' ? (
            /* Error state */
            <div className="px-6 py-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full mb-4">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-medium tracking-tight text-white mb-2">Something went wrong</h3>
              <p className="text-white/60 mb-6">{errorMsg}</p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setStatus('idle')}
                  className="px-6 py-2.5 bg-white text-black text-sm font-semibold rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all"
                >
                  Try Again
                </button>
                <p className="text-xs text-white/30">
                  Or email us directly at{' '}
                  <a href="mailto:ashley@kairo.clinic" className="text-[#4CBD90] underline">
                    ashley@kairo.clinic
                  </a>
                </p>
              </div>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-3 py-2.5 bg-[#1A1A1A] border-none rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 transition-shadow"
                      placeholder="Dr. John Smith"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-3 py-2.5 bg-[#1A1A1A] border-none rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 transition-shadow"
                      placeholder="john@clinic.co.zw"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-3 py-2.5 bg-[#1A1A1A] border-none rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 transition-shadow"
                      placeholder="+263 77 123 4567"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Practice Name *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="text"
                      required
                      value={formData.practiceName}
                      onChange={(e) => setFormData({ ...formData, practiceName: e.target.value })}
                      className="w-full pl-10 pr-3 py-2.5 bg-[#1A1A1A] border-none rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 transition-shadow"
                      placeholder="My Medical Practice"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Practice Size
                </label>
                <select
                  value={formData.practiceSize}
                  onChange={(e) => setFormData({ ...formData, practiceSize: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#1A1A1A] border-none rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-shadow [&>option]:bg-[#1A1A1A]"
                >
                  <option value="">Select practice size</option>
                  <option value="1-3">Solo / Small (1-3 staff)</option>
                  <option value="4-10">Medium (4-10 staff)</option>
                  <option value="11-25">Large (11-25 staff)</option>
                  <option value="25+">Enterprise (25+ staff)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Anything specific you'd like to see?
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-white/30" />
                  <textarea
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 bg-[#1A1A1A] border-none rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 transition-shadow resize-none"
                    placeholder="e.g., billing features, appointment scheduling, WhatsApp notifications..."
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-black text-sm font-semibold rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {status === 'submitting' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Request Demo
                  </>
                )}
              </button>

              <p className="text-xs text-center text-white/30">
                We'll contact you within 24 hours. No spam, ever.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}

/* Button that can be placed anywhere to trigger the demo dialog */
export function RequestDemoButton({ className, children, variant = 'primary' }: {
  className?: string;
  children?: React.ReactNode;
  variant?: 'primary' | 'outline' | 'white';
}) {
  const [open, setOpen] = useState(false);

  const baseStyles: Record<string, string> = {
    primary: 'inline-flex items-center px-8 py-3.5 bg-[#03989E] text-white text-base font-semibold rounded-xl hover:bg-[#027A7F] transition-all shadow-lg shadow-[#03989E]/25 hover:shadow-xl hover:shadow-[#03989E]/30 hover:-translate-y-0.5',
    outline: 'inline-flex items-center px-8 py-3.5 bg-white/10 text-white text-base font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all',
    white: 'inline-flex items-center px-8 py-3.5 bg-white text-[#03989E] text-base font-semibold rounded-xl hover:bg-gray-50 transition-all shadow-lg',
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={className || baseStyles[variant]}
      >
        {children || 'Request a Demo'}
      </button>
      <RequestDemoDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
