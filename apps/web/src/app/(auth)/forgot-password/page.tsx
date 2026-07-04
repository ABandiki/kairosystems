'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, CheckCircle, Loader2, Mail } from 'lucide-react';
import {
  AuthShell,
  authLabel,
  authInput,
  authPrimaryBtn,
  authSecondaryBtn,
  authError,
} from '@/components/auth/auth-shell';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to send reset link');
      }

      setSent(true);
    } catch (err) {
      // Always show success to avoid email enumeration
      setSent(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      image="/notes-writing.jpg"
      imageAlt="A clinician writing patient notes"
      heading="Reset your password"
      description="We'll email you a secure link so you can get back into your practice dashboard."
    >
      {sent ? (
        <>
          <div className="w-14 h-14 bg-[#03989E]/15 border border-[#03989E]/30 rounded-full flex items-center justify-center">
            <CheckCircle className="w-7 h-7 text-[#4CBD90]" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-medium tracking-tight">Check your email</h2>
            <p className="text-white/40 text-sm leading-relaxed">
              If an account exists for <span className="text-white/90 font-medium">{email}</span>,
              we&apos;ve sent a password reset link. Please check your inbox and spam folder.
            </p>
          </div>
          <div className="space-y-3">
            <button
              type="button"
              className={`${authSecondaryBtn} w-full`}
              onClick={() => {
                setSent(false);
                setEmail('');
              }}
            >
              <Mail className="w-4 h-4" />
              Try a different email
            </button>
            <button type="button" className={authPrimaryBtn} onClick={() => router.push('/login')}>
              Back to sign in
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <h2 className="text-3xl font-medium tracking-tight">Forgot password</h2>
            <p className="text-white/40 text-sm">
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className={authError}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className={authLabel}>
                Email address
              </label>
              <input
                id="email"
                type="email"
                className={authInput}
                placeholder="name@practice.co.zw"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                autoComplete="email"
                autoFocus
              />
            </div>

            <button type="submit" className={authPrimaryBtn} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send reset link'
              )}
            </button>

            <button
              type="button"
              className="w-full inline-flex items-center justify-center gap-2 text-sm text-white/40 hover:text-white transition-colors py-2"
              onClick={() => router.push('/login')}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </button>
          </form>
        </>
      )}
    </AuthShell>
  );
}
