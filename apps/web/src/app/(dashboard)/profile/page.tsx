'use client';

import { useEffect, useState, useRef } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/use-auth';
import { staffApi } from '@/lib/api';

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
  const { user, isLoading: authLoading, logout, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  // Dialog states
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setEditForm({
        firstName: user.firstName,
        lastName: user.lastName,
      });
    }
  }, [user]);

  const handleChangePhoto = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For now, just show an alert - file upload would require backend support
      alert('Photo upload feature is coming soon! Please contact your administrator to update your photo.');
    }
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (user) {
      setEditForm({
        firstName: user.firstName,
        lastName: user.lastName,
      });
    }
    setIsEditing(false);
  };

  const handleSaveChanges = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await staffApi.update(user.id, editForm);
      setIsEditing(false);
      if (refreshUser) {
        await refreshUser();
      }
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = () => {
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setShowPasswordDialog(true);
  };

  const handleSubmitPassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      alert('Password must be at least 8 characters long.');
      return;
    }
    // Password change would require backend API support
    alert('Password change feature is coming soon! Please contact your administrator.');
    setShowPasswordDialog(false);
  };

  const handleEnable2FA = () => {
    setShow2FADialog(true);
  };

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
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handlePhotoSelected}
              />
              <Button variant="outline" size="sm" className="mt-4" onClick={handleChangePhoto}>
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
                <Input
                  id="firstName"
                  value={isEditing ? editForm.firstName : user.firstName}
                  readOnly={!isEditing}
                  onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                  className={isEditing ? 'border-primary' : ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={isEditing ? editForm.lastName : user.lastName}
                  readOnly={!isEditing}
                  onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                  className={isEditing ? 'border-primary' : ''}
                />
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
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                  <Button onClick={handleSaveChanges} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={handleEditProfile}>Edit Profile</Button>
              )}
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
              <Button variant="outline" onClick={handleChangePassword}>Change Password</Button>
            </div>
            <div className="flex items-center justify-between py-4 border-b">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
              </div>
              <Button variant="outline" onClick={handleEnable2FA}>Enable 2FA</Button>
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

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitPassword}>
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2FA Dialog */}
      <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Enable two-factor authentication for enhanced security.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600 mb-4">
              Two-factor authentication adds an extra layer of security to your account by requiring a verification code in addition to your password.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">
                This feature is coming soon. Please contact your practice administrator for more information about enabling 2FA on your account.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShow2FADialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
