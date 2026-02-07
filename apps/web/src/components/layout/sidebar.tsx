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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';

const navigation = [
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
  },
  {
    name: 'Staff',
    href: '/staff',
    icon: UserCog,
  },
  {
    name: 'Forms',
    href: '/forms',
    icon: FileText,
  },
  {
    name: 'MY FORMS',
    href: '/forms/questionnaires',
    icon: ClipboardList,
  },
  {
    name: 'Form Builder',
    href: '/forms/templates',
    icon: Hammer,
  },
  {
    name: 'Billing',
    href: '/billing',
    icon: DollarSign,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();

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
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">K</span>
            </div>
            <span className="font-semibold text-xl text-gray-900">Kairo</span>
          </Link>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-lg">K</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
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
