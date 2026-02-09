'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Calendar, Clock, XCircle, AlertCircle } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/stats-card';
import { UpcomingAppointments } from '@/components/dashboard/upcoming-appointments';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { usePatientStats, useAppointmentStats } from '@/hooks/use-api';
import { Skeleton } from '@/components/ui/skeleton';

function StatsCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { data: patientStats, isLoading: patientsLoading } = usePatientStats(!!user);
  const { data: appointmentStats, isLoading: appointmentsLoading } = useAppointmentStats(!!user);

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

  const isStatsLoading = patientsLoading || appointmentsLoading;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">
            Welcome back, {user.firstName} {user.lastName}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push('/appointments')}>
            Add Appointment
          </Button>
          <Button onClick={() => router.push('/patients')}>New Patient</Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isStatsLoading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            <StatsCard
              title="Total Patients"
              value={patientStats?.totalPatients?.toLocaleString() || '0'}
              subtitle={`${patientStats?.registeredToday || 0} registered today`}
              icon={Users}
              variant="info"
              trend={patientStats?.registeredToday ? { value: patientStats.registeredToday, isPositive: true } : undefined}
            />
            <StatsCard
              title="Today's Appointments"
              value={String(appointmentStats?.todayTotal || 0)}
              subtitle={`${appointmentStats?.todayPending || 0} remaining`}
              icon={Calendar}
              variant="success"
            />
            <StatsCard
              title="Missed Appointments"
              value={String(appointmentStats?.monthMissed || 0)}
              subtitle="This month"
              icon={Clock}
              variant="warning"
            />
            <StatsCard
              title="Cancelled"
              value={String(appointmentStats?.monthCancelled || 0)}
              subtitle="This month"
              icon={XCircle}
              variant="danger"
            />
          </>
        )}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming appointments */}
        <div className="lg:col-span-2">
          <UpcomingAppointments />
        </div>

        {/* Quick actions / Recent activity */}
        <div className="space-y-6">
          {/* Quick actions */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-auto py-4 flex-col"
                onClick={() => router.push('/appointments')}
              >
                <Calendar className="h-5 w-5 mb-2" />
                <span className="text-xs">Book Appointment</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex-col"
                onClick={() => router.push('/patients')}
              >
                <Users className="h-5 w-5 mb-2" />
                <span className="text-xs">Register Patient</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex-col"
                onClick={() => router.push('/appointments')}
              >
                <Clock className="h-5 w-5 mb-2" />
                <span className="text-xs">View Waiting</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex-col"
                onClick={() => router.push('/appointments')}
              >
                <XCircle className="h-5 w-5 mb-2" />
                <span className="text-xs">Cancellations</span>
              </Button>
            </div>
          </div>

          {/* Tasks */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Pending Tasks</h3>
            <div className="space-y-3">
              <button
                className="w-full flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors text-left cursor-pointer"
                onClick={() => router.push('/patients')}
              >
                <div className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    5 test results to review
                  </p>
                  <p className="text-xs text-gray-500">Blood tests from lab</p>
                </div>
              </button>
              <button
                className="w-full flex items-center gap-3 p-3 bg-teal-50 rounded-lg border border-teal-200 hover:bg-teal-100 transition-colors text-left cursor-pointer"
                onClick={() => router.push('/notes')}
              >
                <div className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    3 documents to sign
                  </p>
                  <p className="text-xs text-gray-500">Referral letters</p>
                </div>
              </button>
              <button
                className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors text-left cursor-pointer"
                onClick={() => router.push('/billing')}
              >
                <div className="w-2 h-2 bg-gray-500 rounded-full flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    12 repeat prescriptions
                  </p>
                  <p className="text-xs text-gray-500">Awaiting approval</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
