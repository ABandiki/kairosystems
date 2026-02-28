'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3, Users, Calendar, DollarSign, TrendingUp, Activity,
  Loader2, AlertCircle, UserCheck, UserX, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface PracticeAnalytics {
  patientDemographics: {
    gender: Record<string, number>;
    ageGroups: Record<string, number>;
    total: number;
  };
  appointmentStats: {
    byType: Record<string, number>;
    byClinician: Array<{ name: string; count: number }>;
    completionRate: number;
    dnaRate: number;
    totalThisMonth: number;
  };
  revenueStats: {
    monthly: Array<{ month: string; amount: number }>;
    byMethod: Record<string, number>;
    totalCollected: number;
    totalPending: number;
  };
  staffWorkload: Array<{ name: string; role: string; appointments: number; patients: number }>;
}

export default function ReportsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [analytics, setAnalytics] = useState<PracticeAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('access_token');
        const res = await fetch(`${API_BASE_URL}/practices/current/analytics`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setAnalytics(data);
        } else {
          setError('Failed to load analytics');
        }
      } catch {
        setError('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [user]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  const maxBarValue = (values: number[]) => Math.max(...values, 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-500">Practice performance metrics and insights</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <Card key={i}><CardContent className="pt-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">{error}</p>
              <Button variant="outline" className="mt-3" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : analytics ? (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Patients</p>
                    <p className="text-3xl font-bold">{analytics.patientDemographics.total}</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Appointments This Month</p>
                    <p className="text-3xl font-bold">{analytics.appointmentStats.totalThisMonth}</p>
                  </div>
                  <div className="h-12 w-12 bg-teal-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-teal-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Completion Rate</p>
                    <p className="text-3xl font-bold">{analytics.appointmentStats.completionRate}%</p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">DNA Rate</p>
                    <p className="text-3xl font-bold">{analytics.appointmentStats.dnaRate}%</p>
                  </div>
                  <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <UserX className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="patients">
            <TabsList className="bg-white border">
              <TabsTrigger value="patients" className="gap-2">
                <Users className="h-4 w-4" />
                Patient Demographics
              </TabsTrigger>
              <TabsTrigger value="appointments" className="gap-2">
                <Calendar className="h-4 w-4" />
                Appointments
              </TabsTrigger>
              <TabsTrigger value="revenue" className="gap-2">
                <DollarSign className="h-4 w-4" />
                Revenue
              </TabsTrigger>
              <TabsTrigger value="staff" className="gap-2">
                <Activity className="h-4 w-4" />
                Staff Workload
              </TabsTrigger>
            </TabsList>

            {/* Patient Demographics Tab */}
            <TabsContent value="patients" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Gender Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Gender Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(analytics.patientDemographics.gender).map(([gender, count]) => {
                        const total = Object.values(analytics.patientDemographics.gender).reduce((a, b) => a + b, 0);
                        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                        return (
                          <div key={gender}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium capitalize">{gender}</span>
                              <span className="text-sm text-gray-500">{count} ({pct}%)</span>
                            </div>
                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${gender === 'MALE' ? 'bg-blue-500' : gender === 'FEMALE' ? 'bg-pink-500' : 'bg-gray-400'}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Age Groups */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Age Groups</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(analytics.patientDemographics.ageGroups).map(([group, count]) => {
                        const maxVal = maxBarValue(Object.values(analytics.patientDemographics.ageGroups));
                        const pct = Math.round((count / maxVal) * 100);
                        return (
                          <div key={group} className="flex items-center gap-3">
                            <span className="text-sm w-16 text-gray-600">{group}</span>
                            <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
                              <div
                                className="h-full bg-teal-500 rounded flex items-center justify-end pr-2"
                                style={{ width: `${Math.max(pct, 5)}%` }}
                              >
                                <span className="text-xs text-white font-medium">{count}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Appointments Tab */}
            <TabsContent value="appointments" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* By Type */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Appointments by Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(analytics.appointmentStats.byType).map(([type, count]) => {
                        const maxVal = maxBarValue(Object.values(analytics.appointmentStats.byType));
                        const pct = Math.round((count / maxVal) * 100);
                        return (
                          <div key={type} className="flex items-center gap-3">
                            <span className="text-sm w-40 text-gray-600 truncate">{type.replace(/_/g, ' ')}</span>
                            <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded flex items-center justify-end pr-2"
                                style={{ width: `${Math.max(pct, 5)}%` }}
                              >
                                <span className="text-xs text-white font-medium">{count}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {Object.keys(analytics.appointmentStats.byType).length === 0 && (
                        <p className="text-sm text-gray-400 text-center py-4">No appointment data this month</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* By Clinician */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Appointments by Clinician</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics.appointmentStats.byClinician.map((cli) => {
                        const maxVal = maxBarValue(analytics.appointmentStats.byClinician.map(c => c.count));
                        const pct = Math.round((cli.count / maxVal) * 100);
                        return (
                          <div key={cli.name} className="flex items-center gap-3">
                            <span className="text-sm w-40 text-gray-600 truncate">{cli.name}</span>
                            <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
                              <div
                                className="h-full bg-teal-500 rounded flex items-center justify-end pr-2"
                                style={{ width: `${Math.max(pct, 5)}%` }}
                              >
                                <span className="text-xs text-white font-medium">{cli.count}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {analytics.appointmentStats.byClinician.length === 0 && (
                        <p className="text-sm text-gray-400 text-center py-4">No clinician data available</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Revenue Tab */}
            <TabsContent value="revenue" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Revenue Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Revenue Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-600">Collected</p>
                        <p className="text-2xl font-bold text-green-800">${analytics.revenueStats.totalCollected.toFixed(2)}</p>
                      </div>
                      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="text-sm text-amber-600">Pending</p>
                        <p className="text-2xl font-bold text-amber-800">${analytics.revenueStats.totalPending.toFixed(2)}</p>
                      </div>
                    </div>

                    <h4 className="text-sm font-medium text-gray-700 mb-3">By Payment Method</h4>
                    <div className="space-y-2">
                      {Object.entries(analytics.revenueStats.byMethod).map(([method, amount]) => (
                        <div key={method} className="flex items-center justify-between py-2 border-b last:border-0">
                          <span className="text-sm text-gray-600 capitalize">{method.replace(/_/g, ' ').toLowerCase()}</span>
                          <span className="text-sm font-medium">${Number(amount).toFixed(2)}</span>
                        </div>
                      ))}
                      {Object.keys(analytics.revenueStats.byMethod).length === 0 && (
                        <p className="text-sm text-gray-400 text-center py-4">No revenue data</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Monthly Revenue Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Monthly Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end gap-2 h-48">
                      {analytics.revenueStats.monthly.map((m) => {
                        const maxVal = maxBarValue(analytics.revenueStats.monthly.map(x => x.amount));
                        const heightPct = maxVal > 0 ? Math.round((m.amount / maxVal) * 100) : 0;
                        return (
                          <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-xs text-gray-500">${m.amount > 0 ? m.amount.toFixed(0) : '0'}</span>
                            <div className="w-full bg-gray-100 rounded-t relative" style={{ height: '160px' }}>
                              <div
                                className="absolute bottom-0 w-full bg-teal-500 rounded-t transition-all"
                                style={{ height: `${Math.max(heightPct, 2)}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">{m.month}</span>
                          </div>
                        );
                      })}
                      {analytics.revenueStats.monthly.length === 0 && (
                        <p className="text-sm text-gray-400 text-center py-4 w-full">No revenue data</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Staff Workload Tab */}
            <TabsContent value="staff" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Staff Workload This Month</CardTitle>
                  <CardDescription>Appointments and patients handled per staff member</CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics.staffWorkload.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-8">No staff activity data</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-left">
                            <th className="pb-3 font-medium text-gray-600">Staff Member</th>
                            <th className="pb-3 font-medium text-gray-600">Role</th>
                            <th className="pb-3 font-medium text-gray-600 text-right">Appointments</th>
                            <th className="pb-3 font-medium text-gray-600 text-right">Patients</th>
                            <th className="pb-3 font-medium text-gray-600 w-48">Workload</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {analytics.staffWorkload.map((staff, i) => {
                            const maxAppts = maxBarValue(analytics.staffWorkload.map(s => s.appointments));
                            const pct = Math.round((staff.appointments / maxAppts) * 100);
                            return (
                              <tr key={i}>
                                <td className="py-3 font-medium">{staff.name}</td>
                                <td className="py-3">
                                  <Badge variant="outline" className="text-xs">{staff.role.replace(/_/g, ' ')}</Badge>
                                </td>
                                <td className="py-3 text-right">{staff.appointments}</td>
                                <td className="py-3 text-right">{staff.patients}</td>
                                <td className="py-3">
                                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-teal-500 rounded-full"
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : null}
    </div>
  );
}
