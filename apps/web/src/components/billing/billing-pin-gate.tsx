'use client';

import { useState, useEffect } from 'react';
import { invoicesApi } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Lock, Loader2, ShieldCheck } from 'lucide-react';

export function BillingPinGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(true);
  const [hasPinSet, setHasPinSet] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    // If session is already unlocked, skip check
    if (sessionStorage.getItem('billingUnlocked') === 'true') {
      setUnlocked(true);
      setChecking(false);
      return;
    }

    invoicesApi
      .getBillingPinStatus()
      .then((status) => {
        setHasPinSet(status.hasPinSet);
        // Admin always bypasses, or no PIN set = open access
        if (status.canBypass || !status.hasPinSet) {
          sessionStorage.setItem('billingUnlocked', 'true');
          setUnlocked(true);
        }
      })
      .catch(() => {
        // If the check fails, show the PIN entry screen
      })
      .finally(() => {
        setChecking(false);
      });
  }, []);

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    setPin(digits);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setError('');

    try {
      await invoicesApi.verifyBillingPin(pin);
      sessionStorage.setItem('billingUnlocked', 'true');
      setUnlocked(true);
    } catch (err: any) {
      setError(err?.message || 'Invalid PIN. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (unlocked) {
    return <>{children}</>;
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-100">
            <Lock className="h-7 w-7 text-teal-600" />
          </div>
          <CardTitle className="text-xl">Billing Access Protected</CardTitle>
          <CardDescription>
            The billing section is PIN-protected by your Practice Administrator.
            Enter the billing PIN to unlock access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                Enter Billing PIN
              </label>
              <Input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={handlePinChange}
                placeholder="------"
                className="text-center text-2xl tracking-[0.5em]"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={pin.length < 4 || verifying}
            >
              {verifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Unlock Billing
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Contact your Practice Administrator if you don&apos;t know the PIN.
              Access is granted for this session only.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
