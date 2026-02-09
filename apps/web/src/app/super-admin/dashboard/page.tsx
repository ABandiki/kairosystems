'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Shield,
  Building2,
  Users,
  Monitor,
  Search,
  LogOut,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  Plus,
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface Practice {
  id: string;
  name: string;
  odsCode: string;
  email: string;
  subscriptionTier: string;
  isActive: boolean;
  staffCount: number;
  deviceCount: number;
  createdAt: string;
}

interface SuperAdmin {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [superAdmin, setSuperAdmin] = useState<SuperAdmin | null>(null);
  const [practices, setPractices] = useState<Practice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Check if logged in
    const token = localStorage.getItem('super_admin_token');
    const adminData = localStorage.getItem('super_admin');

    if (!token || !adminData) {
      router.push('/super-admin/login');
      return;
    }

    try {
      setSuperAdmin(JSON.parse(adminData));
    } catch (e) {
      router.push('/super-admin/login');
      return;
    }

    loadPractices(token);
  }, [router]);

  const loadPractices = async (token: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/super-admin/practices`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('super_admin_token');
          localStorage.removeItem('super_admin');
          router.push('/super-admin/login');
          return;
        }
        throw new Error('Failed to load practices');
      }

      const data = await response.json();
      setPractices(data);
    } catch (err) {
      console.error('Failed to load practices:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('super_admin_token');
    localStorage.removeItem('super_admin');
    router.push('/super-admin/login');
  };

  const filteredPractices = practices.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.odsCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalPractices: practices.length,
    activePractices: practices.filter((p) => p.isActive).length,
    totalStaff: practices.reduce((sum, p) => sum + p.staffCount, 0),
    totalDevices: practices.reduce((sum, p) => sum + p.deviceCount, 0),
  };

  if (!superAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">Super Admin</h1>
                <p className="text-xs text-slate-400">Kairo System Administration</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-300">
                {superAdmin.firstName} {superAdmin.lastName}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-slate-300 hover:text-white hover:bg-slate-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Building2 className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.totalPractices}</p>
                  <p className="text-sm text-slate-400">Total Practices</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.activePractices}</p>
                  <p className="text-sm text-slate-400">Active Practices</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Users className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.totalStaff}</p>
                  <p className="text-sm text-slate-400">Total Staff</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/20 rounded-lg">
                  <Monitor className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.totalDevices}</p>
                  <p className="text-sm text-slate-400">Registered Devices</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Practices List */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Practices</CardTitle>
                <CardDescription className="text-slate-400">
                  Manage all registered practices
                </CardDescription>
              </div>
              <Button className="bg-amber-500 hover:bg-amber-600">
                <Plus className="h-4 w-4 mr-2" />
                Add Practice
              </Button>
            </div>

            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search practices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full bg-slate-700" />
                <Skeleton className="h-20 w-full bg-slate-700" />
                <Skeleton className="h-20 w-full bg-slate-700" />
              </div>
            ) : filteredPractices.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No practices found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPractices.map((practice) => (
                  <div
                    key={practice.id}
                    className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
                    onClick={() => router.push(`/super-admin/practices/${practice.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-slate-600 rounded-lg">
                        <Building2 className="h-6 w-6 text-slate-300" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-white">{practice.name}</h3>
                          <Badge
                            variant="outline"
                            className={
                              practice.isActive
                                ? 'border-green-500 text-green-400'
                                : 'border-red-500 text-red-400'
                            }
                          >
                            {practice.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline" className="border-slate-500 text-slate-400">
                            {practice.subscriptionTier}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-400">
                          {practice.odsCode} &bull; {practice.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-lg font-semibold text-white">{practice.staffCount}</p>
                        <p className="text-xs text-slate-400">Staff</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-white">{practice.deviceCount}</p>
                        <p className="text-xs text-slate-400">Devices</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-500" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
