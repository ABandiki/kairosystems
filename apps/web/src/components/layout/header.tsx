'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Search, User, Settings, LogOut, Calendar, AlertTriangle, UserPlus, Clock, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'appointment' | 'alert' | 'patient' | 'reminder';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

// Sample notifications - in a real app these would come from an API
const sampleNotifications: Notification[] = [
  {
    id: '1',
    type: 'appointment',
    title: 'Upcoming Appointment',
    message: 'John Smith has an appointment in 15 minutes',
    time: '2 min ago',
    read: false,
  },
  {
    id: '2',
    type: 'alert',
    title: 'Patient Alert',
    message: 'Emma Wilson has a drug allergy flag',
    time: '10 min ago',
    read: false,
  },
  {
    id: '3',
    type: 'patient',
    title: 'New Patient Registration',
    message: 'Sarah Brown has registered at the practice',
    time: '1 hour ago',
    read: false,
  },
  {
    id: '4',
    type: 'reminder',
    title: 'Task Reminder',
    message: 'Review lab results for Michael Johnson',
    time: '2 hours ago',
    read: true,
  },
  {
    id: '5',
    type: 'appointment',
    title: 'Appointment Cancelled',
    message: 'David Lee cancelled their 3:00 PM appointment',
    time: '3 hours ago',
    read: true,
  },
];

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="h-4 w-4 text-teal-500" />;
      case 'alert':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'patient':
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case 'reminder':
        return <Clock className="h-4 w-4 text-purple-500" />;
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/patients?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  const getUserInitials = () => {
    if (user) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    return 'U';
  };

  const getUserDisplayName = () => {
    if (user) {
      const prefix = user.role.includes('GP') ? 'Dr. ' : '';
      return `${prefix}${user.firstName} ${user.lastName}`;
    }
    return 'User';
  };

  const getRoleLabel = () => {
    if (user) {
      return user.role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    }
    return '';
  };

  return (
    <header className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {title && <h1 className="text-xl font-semibold text-gray-900">{title}</h1>}
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search patients..."
            className="pl-9 bg-gray-50 border-gray-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
        </form>

        {/* Notifications */}
        <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white font-medium flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-primary"
                  onClick={markAllAsRead}
                >
                  Mark all as read
                </Button>
              )}
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      'p-4 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors',
                      !notification.read && 'bg-teal-50/50'
                    )}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn(
                            'text-sm',
                            !notification.read && 'font-semibold'
                          )}>
                            {notification.title}
                          </p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 -mt-1 -mr-2 hover:bg-gray-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              dismissNotification(notification.id);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {notifications.length > 0 && (
              <div className="p-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setNotificationsOpen(false);
                    // Could navigate to a dedicated notifications page
                  }}
                >
                  View All Notifications
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar || undefined} alt="User" />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
                <p className="text-xs text-gray-500">{getRoleLabel()}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/profile')}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
