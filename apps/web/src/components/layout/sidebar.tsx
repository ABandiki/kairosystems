'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCog,
  Settings,
  FileText,
  Building2,
  LogOut,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  StickyNote,
  ClipboardList,
  Hammer,
  MessageSquare,
  Pill,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';

// Roles that can access admin-level features
const ADMIN_ROLES = ['PRACTICE_ADMIN', 'PRACTICE_MANAGER'];
// Roles that can access clinical features
const CLINICAL_ROLES = ['PRACTICE_ADMIN', 'PRACTICE_MANAGER', 'GP', 'NURSE', 'HCA'];
// Roles that can access messaging
const MESSAGING_ROLES = ['PRACTICE_ADMIN', 'PRACTICE_MANAGER', 'GP', 'NURSE', 'RECEPTIONIST'];
// Roles that can access billing (PIN-protected for non-admin)
const BILLING_ROLES = ['PRACTICE_ADMIN', 'PRACTICE_MANAGER', 'RECEPTIONIST'];

// Subscription tiers — which features each tier unlocks
// STARTER: Appointments, Patients, Notes, Staff, Settings, Messaging
// PROFESSIONAL: Everything in Starter + Billing, Forms, Form Builder
// CUSTOM: Everything in Professional
const PRO_TIERS = ['PROFESSIONAL', 'CUSTOM']; // Tiers that include billing & forms

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[]; // If undefined, visible to all roles
  minTier?: string[]; // Subscription tiers required (if undefined, available to all tiers)
}

const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Appointments',
    href: '/appointments',
    icon: Calendar,
  },
  {
    name: 'Patients',
    href: '/patients',
    icon: Users,
  },
  {
    name: 'Notes',
    href: '/notes',
    icon: StickyNote,
    roles: CLINICAL_ROLES,
  },
  {
    name: 'Prescriptions',
    href: '/prescriptions',
    icon: Pill,
    roles: CLINICAL_ROLES,
  },
  {
    name: 'Documents',
    href: '/documents',
    icon: FileText,
  },
  {
    name: 'Staff',
    href: '/staff',
    icon: UserCog,
    roles: ADMIN_ROLES,
  },
  {
    name: 'Forms',
    href: '/forms',
    icon: FileText,
    roles: CLINICAL_ROLES,
    minTier: PRO_TIERS,
  },
  {
    name: 'MY FORMS',
    href: '/forms/questionnaires',
    icon: ClipboardList,
    roles: CLINICAL_ROLES,
    minTier: PRO_TIERS,
  },
  {
    name: 'Form Builder',
    href: '/forms/templates',
    icon: Hammer,
    roles: ADMIN_ROLES,
    minTier: PRO_TIERS,
  },
  {
    name: 'Submissions',
    href: '/forms/submissions',
    icon: ClipboardList,
    roles: CLINICAL_ROLES,
    minTier: PRO_TIERS,
  },
  {
    name: 'Billing',
    href: '/billing',
    icon: DollarSign,
    roles: BILLING_ROLES,
    minTier: PRO_TIERS,
  },
  {
    name: 'Messaging',
    href: '/messaging',
    icon: MessageSquare,
    roles: MESSAGING_ROLES,
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: BarChart3,
    roles: ADMIN_ROLES,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    roles: ADMIN_ROLES,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { logout, user } = useAuth();

  const userTier = user?.subscriptionTier || 'STARTER';

  // Filter navigation items based on user role AND subscription tier
  const visibleNavigation = navigation.filter((item) => {
    // Check role access
    if (item.roles && (!user?.role || !item.roles.includes(user.role))) {
      return false;
    }
    // Check subscription tier access
    if (item.minTier && !item.minTier.includes(userTier)) {
      return false;
    }
    return true;
  });

  return (
    <div
      className={cn(
        'flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-gray-200">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/favicon.svg" alt="Kairo" className="w-8 h-8 rounded-lg" />
            <span className="font-semibold text-xl text-gray-900">Kairo</span>
          </Link>
        )}
        {collapsed && (
          <img src="/favicon.svg" alt="Kairo" className="w-8 h-8 rounded-lg mx-auto" />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {visibleNavigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>

      {/* User section */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'w-full text-gray-600 hover:text-gray-900',
            collapsed ? 'justify-center' : 'justify-start'
          )}
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Sign Out</span>}
        </Button>
      </div>
    </div>
  );
}
