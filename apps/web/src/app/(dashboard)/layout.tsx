'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { TrialBanner } from '@/components/trial-banner';
import { TrialExpiredScreen } from '@/components/trial-expired';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [trialExpired, setTrialExpired] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const checkTrial = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('access_token');
        if (!token) {
          setChecked(true);
          return;
        }

        const res = await fetch(`${API_BASE_URL}/practices/trial-status`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'x-device-fingerprint': localStorage.getItem('device_fingerprint') || '',
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.trialExpired) {
            setTrialExpired(true);
          }
        } else if (res.status === 403) {
          // Could be trial expired from guard
          const data = await res.json();
          if (data.message && data.message.includes('TRIAL_EXPIRED')) {
            setTrialExpired(true);
          }
        }
      } catch (err) {
        // silently fail
      } finally {
        setChecked(true);
      }
    };

    checkTrial();
    // Recheck every 2 minutes
    const interval = setInterval(checkTrial, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Show nothing until we've checked trial status
  if (!checked) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#03989E]"></div>
      </div>
    );
  }

  // Trial expired - show lockout
  if (trialExpired) {
    return <TrialExpiredScreen />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TrialBanner />
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
