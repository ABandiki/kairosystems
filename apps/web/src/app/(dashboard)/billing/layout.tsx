'use client';

import { BillingPinGate } from '@/components/billing/billing-pin-gate';

export default function BillingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BillingPinGate>{children}</BillingPinGate>;
}
