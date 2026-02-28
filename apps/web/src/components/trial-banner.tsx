'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Clock, X } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface TrialStatus {
  practiceName: string;
  isTrial: boolean;
  trialEndsAt: string | null;
  trialExpired: boolean;
  hoursRemaining: number;
  subscriptionTier: string;
  isActive: boolean;
}

export function TrialBanner() {
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchTrialStatus = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('access_token');
        if (!token) return;

        const res = await fetch(`${API_BASE_URL}/practices/trial-status`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'x-device-fingerprint': localStorage.getItem('device_fingerprint') || '',
          },
        });

        if (res.ok) {
          const data = await res.json();
          setTrialStatus(data);
        }
      } catch (err) {
        // silently fail
      }
    };

    fetchTrialStatus();
    // Check every 5 minutes
    const interval = setInterval(fetchTrialStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (!trialStatus || !trialStatus.isTrial || dismissed) return null;

  const hours = trialStatus.hoursRemaining;
  const isUrgent = hours < 12;
  const isWarning = hours < 24;

  const formatTimeRemaining = () => {
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = Math.round(hours % 24);
      return `${days} day${days > 1 ? 's' : ''} and ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`;
    }
    if (hours >= 1) {
      return `${Math.round(hours)} hour${Math.round(hours) !== 1 ? 's' : ''}`;
    }
    const minutes = Math.round(hours * 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  return (
    <div
      className={`px-4 py-2.5 text-sm flex items-center justify-between ${
        isUrgent
          ? 'bg-red-600 text-white'
          : isWarning
          ? 'bg-amber-500 text-white'
          : 'bg-[#03989E] text-white'
      }`}
    >
      <div className="flex items-center gap-2">
        {isUrgent ? (
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        ) : (
          <Clock className="w-4 h-4 flex-shrink-0" />
        )}
        <span>
          <strong>Free Trial</strong> &mdash; {formatTimeRemaining()} remaining.
          Contact <a href="mailto:ashley@kairo.clinic" className="underline font-medium">ashley@kairo.clinic</a> or
          call <a href="tel:+263785767099" className="underline font-medium">+263 785 767 099</a> to subscribe.
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="ml-4 p-1 hover:bg-white/20 rounded transition-colors flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
