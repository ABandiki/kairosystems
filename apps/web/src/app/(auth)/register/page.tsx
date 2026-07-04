'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';
import { onboardingApi } from '@/lib/api';
import { initDeviceFingerprint, getDeviceName, getDeviceType } from '@/lib/device-fingerprint';
import Link from 'next/link';
import {
  AuthShell,
  authLabel,
  authInput,
  authPrimaryBtn,
  authSecondaryBtn,
  authError,
} from '@/components/auth/auth-shell';

type Step = 'practice' | 'admin' | 'confirm';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('practice');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [deviceFingerprint, setDeviceFingerprint] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [deviceType, setDeviceType] = useState('');

  // Practice details
  const [practiceForm, setPracticeForm] = useState({
    practiceName: '',
    practiceEmail: '',
    practicePhone: '',
    odsCode: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    county: '',
    postcode: '',
  });

  // Admin details
  const [adminForm, setAdminForm] = useState({
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: '',
  });

  // Initialize device fingerprint on mount
  useEffect(() => {
    const init = async () => {
      try {
        const fingerprint = await initDeviceFingerprint();
        setDeviceFingerprint(fingerprint);
        setDeviceName(getDeviceName());
        setDeviceType(getDeviceType());
      } catch (e) {
        console.error('Failed to get device fingerprint:', e);
      }
    };
    init();
  }, []);

  const validatePracticeStep = () => {
    if (!practiceForm.practiceName.trim()) return 'Practice name is required';
    if (!practiceForm.practiceEmail.trim()) return 'Practice email is required';
    if (!practiceForm.practicePhone.trim()) return 'Practice phone is required';
    if (!practiceForm.odsCode.trim()) return 'Practice code is required';
    if (!practiceForm.addressLine1.trim()) return 'Address is required';
    if (!practiceForm.city.trim()) return 'City is required';
    if (!practiceForm.postcode.trim()) return 'Postcode is required';
    return null;
  };

  const validateAdminStep = () => {
    if (!adminForm.adminFirstName.trim()) return 'First name is required';
    if (!adminForm.adminLastName.trim()) return 'Last name is required';
    if (!adminForm.adminEmail.trim()) return 'Email is required';
    if (!adminForm.adminPassword) return 'Password is required';
    if (adminForm.adminPassword.length < 8) return 'Password must be at least 8 characters';
    if (adminForm.adminPassword !== adminForm.confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleNext = () => {
    setError('');
    if (step === 'practice') {
      const err = validatePracticeStep();
      if (err) {
        setError(err);
        return;
      }
      setStep('admin');
    } else if (step === 'admin') {
      const err = validateAdminStep();
      if (err) {
        setError(err);
        return;
      }
      setStep('confirm');
    }
  };

  const handleBack = () => {
    setError('');
    if (step === 'admin') setStep('practice');
    if (step === 'confirm') setStep('admin');
  };

  const handleSubmit = async () => {
    setError('');
    setIsLoading(true);

    try {
      const response = await onboardingApi.registerPractice({
        ...practiceForm,
        ...adminForm,
        deviceFingerprint,
        deviceName,
        deviceType,
      });

      // Token is already set by the API function
      // Store user data
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      image="/herbs-market.jpg"
      imageAlt="Traditional herbal medicines at an African market stall"
      heading="Join Kairo"
      description="Three quick steps and your practice is up and running — free for 2 days, no credit card required."
      steps={[
        { number: 1, text: 'Register your practice', active: step === 'practice' },
        { number: 2, text: 'Create your admin account', active: step === 'admin' },
        { number: 3, text: 'Confirm & launch', active: step === 'confirm' },
      ]}
    >
      <div className="space-y-2">
        <h2 className="text-3xl font-medium tracking-tight">
          {step === 'practice' && 'Practice details'}
          {step === 'admin' && 'Administrator account'}
          {step === 'confirm' && 'Confirm registration'}
        </h2>
        <p className="text-white/40 text-sm">
          {step === 'practice' && 'Tell us about your practice to begin.'}
          {step === 'admin' && 'Create the login you will manage the practice with.'}
          {step === 'confirm' && 'Review everything before we set up your space.'}
        </p>
      </div>

      {error && (
        <div className={authError}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Practice Details */}
      {step === 'practice' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-2">
            <label htmlFor="practiceName" className={authLabel}>Practice name *</label>
            <input
              id="practiceName"
              className={authInput}
              value={practiceForm.practiceName}
              onChange={(e) => setPracticeForm({ ...practiceForm, practiceName: e.target.value })}
              placeholder="Avondale Medical Centre"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="odsCode" className={authLabel}>Practice code *</label>
            <input
              id="odsCode"
              className={authInput}
              value={practiceForm.odsCode}
              onChange={(e) => setPracticeForm({ ...practiceForm, odsCode: e.target.value })}
              placeholder="ABC123"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="practicePhone" className={authLabel}>Phone *</label>
            <input
              id="practicePhone"
              className={authInput}
              value={practiceForm.practicePhone}
              onChange={(e) => setPracticeForm({ ...practiceForm, practicePhone: e.target.value })}
              placeholder="+263 4 123 4567"
            />
          </div>
          <div className="col-span-2 space-y-2">
            <label htmlFor="practiceEmail" className={authLabel}>Practice email *</label>
            <input
              id="practiceEmail"
              type="email"
              className={authInput}
              value={practiceForm.practiceEmail}
              onChange={(e) => setPracticeForm({ ...practiceForm, practiceEmail: e.target.value })}
              placeholder="info@practice.co.zw"
            />
          </div>
          <div className="col-span-2 space-y-2">
            <label htmlFor="addressLine1" className={authLabel}>Address line 1 *</label>
            <input
              id="addressLine1"
              className={authInput}
              value={practiceForm.addressLine1}
              onChange={(e) => setPracticeForm({ ...practiceForm, addressLine1: e.target.value })}
              placeholder="123 Health Street"
            />
          </div>
          <div className="col-span-2 space-y-2">
            <label htmlFor="addressLine2" className={authLabel}>Address line 2</label>
            <input
              id="addressLine2"
              className={authInput}
              value={practiceForm.addressLine2}
              onChange={(e) => setPracticeForm({ ...practiceForm, addressLine2: e.target.value })}
              placeholder="Suite 100"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="city" className={authLabel}>City *</label>
            <input
              id="city"
              className={authInput}
              value={practiceForm.city}
              onChange={(e) => setPracticeForm({ ...practiceForm, city: e.target.value })}
              placeholder="Harare"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="county" className={authLabel}>County/Province</label>
            <input
              id="county"
              className={authInput}
              value={practiceForm.county}
              onChange={(e) => setPracticeForm({ ...practiceForm, county: e.target.value })}
              placeholder="Harare Province"
            />
          </div>
          <div className="col-span-2 space-y-2">
            <label htmlFor="postcode" className={authLabel}>Postcode *</label>
            <input
              id="postcode"
              className={authInput}
              value={practiceForm.postcode}
              onChange={(e) => setPracticeForm({ ...practiceForm, postcode: e.target.value })}
              placeholder="00000"
            />
          </div>
        </div>
      )}

      {/* Step 2: Admin Account */}
      {step === 'admin' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="adminFirstName" className={authLabel}>First name *</label>
            <input
              id="adminFirstName"
              className={authInput}
              value={adminForm.adminFirstName}
              onChange={(e) => setAdminForm({ ...adminForm, adminFirstName: e.target.value })}
              placeholder="John"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="adminLastName" className={authLabel}>Last name *</label>
            <input
              id="adminLastName"
              className={authInput}
              value={adminForm.adminLastName}
              onChange={(e) => setAdminForm({ ...adminForm, adminLastName: e.target.value })}
              placeholder="Doe"
            />
          </div>
          <div className="col-span-2 space-y-2">
            <label htmlFor="adminEmail" className={authLabel}>Email address *</label>
            <input
              id="adminEmail"
              type="email"
              className={authInput}
              value={adminForm.adminEmail}
              onChange={(e) => setAdminForm({ ...adminForm, adminEmail: e.target.value })}
              placeholder="admin@practice.co.zw"
            />
          </div>
          <div className="col-span-2 space-y-2">
            <label htmlFor="adminPassword" className={authLabel}>Password *</label>
            <input
              id="adminPassword"
              type="password"
              className={authInput}
              value={adminForm.adminPassword}
              onChange={(e) => setAdminForm({ ...adminForm, adminPassword: e.target.value })}
              placeholder="••••••••"
              autoComplete="new-password"
            />
            <p className="text-xs text-white/30">Requires at least 8 characters.</p>
          </div>
          <div className="col-span-2 space-y-2">
            <label htmlFor="confirmPassword" className={authLabel}>Confirm password *</label>
            <input
              id="confirmPassword"
              type="password"
              className={authInput}
              value={adminForm.confirmPassword}
              onChange={(e) => setAdminForm({ ...adminForm, confirmPassword: e.target.value })}
              placeholder="Repeat your password"
              autoComplete="new-password"
            />
          </div>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 'confirm' && (
        <div className="space-y-4">
          <div className="p-4 bg-[#1A1A1A] rounded-xl">
            <h3 className="text-sm font-medium text-white mb-3">Practice details</h3>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="text-white/40">Name:</dt>
              <dd className="text-white/90">{practiceForm.practiceName}</dd>
              <dt className="text-white/40">Practice code:</dt>
              <dd className="text-white/90">{practiceForm.odsCode}</dd>
              <dt className="text-white/40">Email:</dt>
              <dd className="text-white/90">{practiceForm.practiceEmail}</dd>
              <dt className="text-white/40">Phone:</dt>
              <dd className="text-white/90">{practiceForm.practicePhone}</dd>
              <dt className="text-white/40">Address:</dt>
              <dd className="text-white/90">{practiceForm.addressLine1}, {practiceForm.city}</dd>
            </dl>
          </div>

          <div className="p-4 bg-[#1A1A1A] rounded-xl">
            <h3 className="text-sm font-medium text-white mb-3">Administrator</h3>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="text-white/40">Name:</dt>
              <dd className="text-white/90">{adminForm.adminFirstName} {adminForm.adminLastName}</dd>
              <dt className="text-white/40">Email:</dt>
              <dd className="text-white/90">{adminForm.adminEmail}</dd>
            </dl>
          </div>

          <div className="p-4 bg-[#03989E]/10 border border-[#03989E]/30 rounded-xl">
            <h3 className="text-sm font-medium text-[#4CBD90] mb-1 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              This device will be registered
            </h3>
            <p className="text-sm text-white/60">
              {deviceName} will be automatically approved as your first practice device.
            </p>
          </div>

          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <h3 className="text-sm font-medium text-amber-300 mb-1">Plan: Starter</h3>
            <p className="text-sm text-white/60">
              Your Starter plan includes 3 staff members. Contact us to upgrade to
              Professional or Custom.
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        {step !== 'practice' ? (
          <button type="button" className={authSecondaryBtn} onClick={handleBack} disabled={isLoading}>
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
        ) : (
          <Link href="/login" className="text-sm text-white/40 hover:text-white transition-colors">
            Member of a practice? <span className="text-white font-medium">Sign in</span>
          </Link>
        )}

        {step !== 'confirm' ? (
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center justify-center gap-2 h-12 px-6 bg-white text-black text-sm font-semibold rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 h-12 px-6 bg-white text-black text-sm font-semibold rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              'Complete registration'
            )}
          </button>
        )}
      </div>
    </AuthShell>
  );
}
