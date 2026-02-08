'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2, Stethoscope } from 'lucide-react';

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

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
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#03989E] rounded-xl mb-4">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Kairo</h1>
          <p className="text-gray-600">GP Practice Management System</p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
            <CardDescription className="text-center">
              Sign in to access your practice dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@practice.nhs.uk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoComplete="email"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="text-sm text-[#03989E] hover:text-[#027A7F]"
                  >
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-500 text-center mb-3">
                Demo Credentials
              </p>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="font-medium">Admin:</span>
                  <span className="text-right">admin@avondale-medical.co.zw</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="font-medium">GP:</span>
                  <span className="text-right">dr.chikwanha@avondale-medical.co.zw</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="font-medium">Nurse:</span>
                  <span className="text-right">nurse.mutasa@avondale-medical.co.zw</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="font-medium">Reception:</span>
                  <span className="text-right">reception@avondale-medical.co.zw</span>
                </div>
                <div className="flex justify-between p-2 bg-teal-50 rounded border border-teal-200">
                  <span className="font-medium text-teal-700">Password (all):</span>
                  <span className="font-mono text-teal-800">Password123!</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-500 mt-6">
          KairoSystems - Healthcare Management for Zimbabwe
        </p>
      </div>
    </div>
  );
}
