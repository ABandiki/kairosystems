'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, Shield, Calendar, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';

const roleLabels: Record<string, string> = {
  GP_PARTNER: 'GP Partner',
  GP_SALARIED: 'Salaried GP',
  GP_REGISTRAR: 'GP Registrar',
  GP: 'GP',
  PRACTICE_NURSE: 'Practice Nurse',
  HEALTHCARE_ASSISTANT: 'Healthcare Assistant',
  RECEPTIONIST: 'Receptionist',
  PRACTICE_MANAGER: 'Practice Manager',
  PRACTICE_ADMIN: 'Practice Admin',
  ADMIN: 'Admin',
  PHARMACIST: 'Pharmacist',
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading: authLoading, logout } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getUserInitials = () => {
    return `${user.firstName[0]}${user.lastName[0]}`;
  };

  const getUserDisplayName = () => {
    const prefix = user.role.includes('GP') ? 'Dr. ' : '';
    return `${prefix}${user.firstName} ${user.lastName}`;
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500">View and manage your account information</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={user.avatar || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold">{getUserDisplayName()}</h2>
              <Badge variant="secondary" className="mt-2">
                {roleLabels[user.role] || user.role.replace(/_/g, ' ')}
              </Badge>
              <p className="text-sm text-gray-500 mt-2">{user.email}</p>
              <Button variant="outline" size="sm" className="mt-4">
                Change Photo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>
              Your personal information and account settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" value={user.firstName} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" value={user.lastName} readOnly />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input id="email" value={user.email} readOnly className="pl-9" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="role"
                  value={roleLabels[user.role] || user.role.replace(/_/g, ' ')}
                  readOnly
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline">Edit Profile</Button>
              <Button>Save Changes</Button>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>
              Manage your password and account security settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between py-4 border-b">
              <div>
                <p className="font-medium">Password</p>
                <p className="text-sm text-gray-500">Last changed: Never</p>
              </div>
              <Button variant="outline">Change Password</Button>
            </div>
            <div className="flex items-center justify-between py-4 border-b">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
              </div>
              <Button variant="outline">Enable 2FA</Button>
            </div>
            <div className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium text-red-600">Sign Out</p>
                <p className="text-sm text-gray-500">Sign out from your account on this device</p>
              </div>
              <Button variant="destructive" onClick={logout}>Sign Out</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
