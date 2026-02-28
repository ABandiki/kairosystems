'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Calendar, Clock, XCircle, AlertCircle, FileText, DollarSign, Pill, Monitor } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/stats-card';
import { UpcomingAppointments } from '@/components/dashboard/upcoming-appointments';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { usePatientStats, useAppointmentStats } from '@/hooks/use-api';
import { Skeleton } from '@/components/ui/skeleton';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface PendingTask {
  type: string;
  label: string;
  count: number;
  route: string;
  color: string;
}

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

const taskIcons: Record<string, typeof FileText> = {
  pending_invoices: DollarSign,
  overdue_invoices: AlertCircle,
  pending_devices: Monitor,
  draft_notes: FileText,
  upcoming_appointments: Calendar,
  active_prescriptions: Pill,
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { data: patientStats, isLoading: patientsLoading } = usePatientStats(!!user);
  const { data: appointmentStats, isLoading: appointmentsLoading } = useAppointmentStats(!!user);
  const [tasks, setTasks] = useState<PendingTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch real pending tasks
  useEffect(() => {
    if (!user) return;
    const fetchTasks = async () => {
      setTasksLoading(true);
      try {
        const token = localStorage.getItem('access_token');
        const res = await fetch(`${API_BASE_URL}/dashboard/tasks`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setTasks(data);
        } else {
          setTasks([]);
        }
      } catch {
        setTasks([]);
      } finally {
        setTasksLoading(false);
      }
    };
    fetchTasks();
  }, [user]);

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
  const activeTasks = tasks.filter(t => t.count > 0);

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

        {/* Quick actions / Pending tasks */}
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
                onClick={() => router.push('/notes/new')}
              >
                <FileText className="h-5 w-5 mb-2" />
                <span className="text-xs">New Note</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex-col"
                onClick={() => router.push('/prescriptions')}
              >
                <Pill className="h-5 w-5 mb-2" />
                <span className="text-xs">Prescriptions</span>
              </Button>
            </div>
          </div>

          {/* Pending Tasks - Real data from API */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Pending Tasks</h3>
            <div className="space-y-3">
              {tasksLoading ? (
                <>
                  <Skeleton className="h-14 w-full rounded-lg" />
                  <Skeleton className="h-14 w-full rounded-lg" />
                  <Skeleton className="h-14 w-full rounded-lg" />
                </>
              ) : activeTasks.length === 0 ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">All caught up! No pending tasks.</p>
                </div>
              ) : (
                activeTasks.map((task) => {
                  const Icon = taskIcons[task.type] || AlertCircle;
                  const bgColor = task.color === 'amber' ? 'bg-amber-50 border-amber-200 hover:bg-amber-100' :
                    task.color === 'red' ? 'bg-red-50 border-red-200 hover:bg-red-100' :
                    task.color === 'teal' ? 'bg-teal-50 border-teal-200 hover:bg-teal-100' :
                    task.color === 'blue' ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' :
                    task.color === 'purple' ? 'bg-purple-50 border-purple-200 hover:bg-purple-100' :
                    'bg-gray-50 border-gray-200 hover:bg-gray-100';
                  const dotColor = task.color === 'amber' ? 'bg-amber-500' :
                    task.color === 'red' ? 'bg-red-500' :
                    task.color === 'teal' ? 'bg-teal-500' :
                    task.color === 'blue' ? 'bg-blue-500' :
                    task.color === 'purple' ? 'bg-purple-500' :
                    'bg-gray-500';

                  return (
                    <button
                      key={task.type}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left cursor-pointer ${bgColor}`}
                      onClick={() => router.push(task.route)}
                    >
                      <div className={`w-2 h-2 ${dotColor} rounded-full flex-shrink-0`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {task.count} {task.label}
                        </p>
                      </div>
                      <Icon className="h-4 w-4 text-gray-400" />
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
