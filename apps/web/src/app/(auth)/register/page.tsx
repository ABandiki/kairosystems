'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';
import { onboardingApi, setAccessToken } from '@/lib/api';
import { initDeviceFingerprint, getDeviceName, getDeviceType } from '@/lib/device-fingerprint';
import Link from 'next/link';

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
    if (!practiceForm.odsCode.trim()) return 'ODS Code is required';
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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" alt="Kairo" className="w-16 h-16 mx-auto mb-4 rounded-xl hover:opacity-80 transition-opacity cursor-pointer" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Register Your Practice</h1>
          <p className="text-gray-600">Set up your practice on Kairo</p>
        </div>

        {/* Progress steps */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${step === 'practice' ? 'bg-[#03989E] text-white' : 'bg-white text-gray-600'}`}>
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">1</span>
            Practice
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${step === 'admin' ? 'bg-[#03989E] text-white' : 'bg-white text-gray-600'}`}>
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">2</span>
            Admin
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${step === 'confirm' ? 'bg-[#03989E] text-white' : 'bg-white text-gray-600'}`}>
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">3</span>
            Confirm
          </div>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">
              {step === 'practice' && 'Practice Details'}
              {step === 'admin' && 'Administrator Account'}
              {step === 'confirm' && 'Confirm Registration'}
            </CardTitle>
            <CardDescription>
              {step === 'practice' && 'Enter your practice information'}
              {step === 'admin' && 'Create your admin login credentials'}
              {step === 'confirm' && 'Review and confirm your details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200 mb-4">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Step 1: Practice Details */}
            {step === 'practice' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="practiceName">Practice Name *</Label>
                    <Input
                      id="practiceName"
                      value={practiceForm.practiceName}
                      onChange={(e) => setPracticeForm({ ...practiceForm, practiceName: e.target.value })}
                      placeholder="Avondale Medical Centre"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="odsCode">ODS Code *</Label>
                    <Input
                      id="odsCode"
                      value={practiceForm.odsCode}
                      onChange={(e) => setPracticeForm({ ...practiceForm, odsCode: e.target.value })}
                      placeholder="ABC123"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="practicePhone">Phone *</Label>
                    <Input
                      id="practicePhone"
                      value={practiceForm.practicePhone}
                      onChange={(e) => setPracticeForm({ ...practiceForm, practicePhone: e.target.value })}
                      placeholder="+263 4 123 4567"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="practiceEmail">Practice Email *</Label>
                    <Input
                      id="practiceEmail"
                      type="email"
                      value={practiceForm.practiceEmail}
                      onChange={(e) => setPracticeForm({ ...practiceForm, practiceEmail: e.target.value })}
                      placeholder="info@practice.co.zw"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="addressLine1">Address Line 1 *</Label>
                    <Input
                      id="addressLine1"
                      value={practiceForm.addressLine1}
                      onChange={(e) => setPracticeForm({ ...practiceForm, addressLine1: e.target.value })}
                      placeholder="123 Health Street"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="addressLine2">Address Line 2</Label>
                    <Input
                      id="addressLine2"
                      value={practiceForm.addressLine2}
                      onChange={(e) => setPracticeForm({ ...practiceForm, addressLine2: e.target.value })}
                      placeholder="Suite 100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={practiceForm.city}
                      onChange={(e) => setPracticeForm({ ...practiceForm, city: e.target.value })}
                      placeholder="Harare"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="county">County/Province</Label>
                    <Input
                      id="county"
                      value={practiceForm.county}
                      onChange={(e) => setPracticeForm({ ...practiceForm, county: e.target.value })}
                      placeholder="Harare Province"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="postcode">Postcode *</Label>
                    <Input
                      id="postcode"
                      value={practiceForm.postcode}
                      onChange={(e) => setPracticeForm({ ...practiceForm, postcode: e.target.value })}
                      placeholder="00000"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Admin Account */}
            {step === 'admin' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminFirstName">First Name *</Label>
                    <Input
                      id="adminFirstName"
                      value={adminForm.adminFirstName}
                      onChange={(e) => setAdminForm({ ...adminForm, adminFirstName: e.target.value })}
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminLastName">Last Name *</Label>
                    <Input
                      id="adminLastName"
                      value={adminForm.adminLastName}
                      onChange={(e) => setAdminForm({ ...adminForm, adminLastName: e.target.value })}
                      placeholder="Doe"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="adminEmail">Email Address *</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      value={adminForm.adminEmail}
                      onChange={(e) => setAdminForm({ ...adminForm, adminEmail: e.target.value })}
                      placeholder="admin@practice.co.zw"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="adminPassword">Password *</Label>
                    <Input
                      id="adminPassword"
                      type="password"
                      value={adminForm.adminPassword}
                      onChange={(e) => setAdminForm({ ...adminForm, adminPassword: e.target.value })}
                      placeholder="At least 8 characters"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={adminForm.confirmPassword}
                      onChange={(e) => setAdminForm({ ...adminForm, confirmPassword: e.target.value })}
                      placeholder="Repeat your password"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 'confirm' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Practice Details</h3>
                    <dl className="grid grid-cols-2 gap-2 text-sm">
                      <dt className="text-gray-500">Name:</dt>
                      <dd className="font-medium">{practiceForm.practiceName}</dd>
                      <dt className="text-gray-500">ODS Code:</dt>
                      <dd className="font-medium">{practiceForm.odsCode}</dd>
                      <dt className="text-gray-500">Email:</dt>
                      <dd className="font-medium">{practiceForm.practiceEmail}</dd>
                      <dt className="text-gray-500">Phone:</dt>
                      <dd className="font-medium">{practiceForm.practicePhone}</dd>
                      <dt className="text-gray-500">Address:</dt>
                      <dd className="font-medium">{practiceForm.addressLine1}, {practiceForm.city}</dd>
                    </dl>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Administrator</h3>
                    <dl className="grid grid-cols-2 gap-2 text-sm">
                      <dt className="text-gray-500">Name:</dt>
                      <dd className="font-medium">{adminForm.adminFirstName} {adminForm.adminLastName}</dd>
                      <dt className="text-gray-500">Email:</dt>
                      <dd className="font-medium">{adminForm.adminEmail}</dd>
                    </dl>
                  </div>

                  <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
                    <h3 className="font-medium text-teal-800 mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      This Device Will Be Registered
                    </h3>
                    <p className="text-sm text-teal-700">
                      {deviceName} will be automatically approved as your first practice device.
                    </p>
                  </div>

                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <h3 className="font-medium text-amber-800 mb-1">Plan: Starter</h3>
                    <p className="text-sm text-amber-700">
                      Your Starter plan includes 3 staff members.
                      Contact us to upgrade to Professional or Custom.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between mt-6 pt-4 border-t">
              {step !== 'practice' ? (
                <Button variant="outline" onClick={handleBack} disabled={isLoading}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              ) : (
                <a href="/login" className="text-sm text-[#03989E] hover:underline self-center">
                  Already have an account? Sign in
                </a>
              )}

              {step !== 'confirm' ? (
                <Button onClick={handleNext}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    'Complete Registration'
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-500 mt-6">
          KairoSystems - Healthcare Management for Africa
        </p>
      </div>
    </div>
  );
}
