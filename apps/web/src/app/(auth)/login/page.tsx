'use client';

import { useState, useRef, useCallback } from 'react';
import Script from 'next/script';
import { useAuth } from '@/hooks/use-auth';
import { AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { TrialExpiredScreen } from '@/components/trial-expired';
import Link from 'next/link';
import {
  AuthShell,
  authLabel,
  authInput,
  authPrimaryBtn,
  authError,
} from '@/components/auth/auth-shell';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

declare global {
  interface Window {
    google?: any;
  }
}

export default function LoginPage() {
  const { login, loginWithGoogle, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [trialExpired, setTrialExpired] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const handleGoogleCredential = useCallback(
    async (response: { credential: string }) => {
      setError('');
      try {
        await loginWithGoogle(response.credential);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Google sign-in failed. Please try again.';
        if (message.includes('TRIAL_EXPIRED')) {
          setTrialExpired(true);
        } else {
          setError(message);
        }
      }
    },
    [loginWithGoogle],
  );

  const initGoogleButton = useCallback(() => {
    if (!GOOGLE_CLIENT_ID || !window.google || !googleButtonRef.current) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredential,
    });
    window.google.accounts.id.renderButton(googleButtonRef.current, {
      theme: 'filled_black',
      size: 'large',
      shape: 'pill',
      text: 'signin_with',
      width: 320,
    });
  }, [handleGoogleCredential]);

  if (trialExpired) {
    return <TrialExpiredScreen />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      await login(email, password);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed. Please try again.';
      if (message.includes('TRIAL_EXPIRED')) {
        setTrialExpired(true);
      } else {
        setError(message);
      }
    }
  };

  return (
    <AuthShell
      image="/notes-writing.jpg"
      imageAlt="A clinician writing patient notes"
      heading="Welcome back"
      description="Sign in to pick up where your practice left off — appointments, records and notes, all in one place."
    >
      <div className="space-y-2">
        <h2 className="text-3xl font-medium tracking-tight">Sign in to Kairo</h2>
        <p className="text-white/40 text-sm">
          Enter your credentials to access your practice dashboard.
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
            Email
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

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className={authLabel}>
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-sm text-white/40 hover:text-white transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className={`${authInput} pr-11`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              autoComplete="current-password"
            />
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button type="submit" className={`${authPrimaryBtn} mt-2`} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      {GOOGLE_CLIENT_ID && (
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-black px-4 text-xs font-medium text-white/40 uppercase tracking-widest">
                Or
              </span>
            </div>
          </div>

          <div className="flex justify-center">
            <div ref={googleButtonRef} />
          </div>

          <Script
            src="https://accounts.google.com/gsi/client"
            strategy="afterInteractive"
            onReady={initGoogleButton}
          />
        </>
      )}

      <p className="text-sm text-white/40">
        New to Kairo?{' '}
        <Link href="/register" className="text-white hover:text-white/80 font-medium transition-colors">
          Start your free trial
        </Link>
      </p>
    </AuthShell>
  );
}
