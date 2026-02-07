import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

const variantStyles = {
  default: {
    bg: 'bg-gray-50',
    icon: 'bg-gray-100 text-gray-600',
  },
  success: {
    bg: 'bg-green-50',
    icon: 'bg-green-100 text-green-600',
  },
  warning: {
    bg: 'bg-amber-50',
    icon: 'bg-amber-100 text-amber-600',
  },
  danger: {
    bg: 'bg-red-50',
    icon: 'bg-red-100 text-red-600',
  },
  info: {
    bg: 'bg-teal-50',
    icon: 'bg-teal-100 text-teal-600',
  },
};

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
}: StatsCardProps) {
  const styles = variantStyles[variant];

  return (
    <div className={cn('rounded-lg border bg-white p-6')}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-semibold text-gray-900">{value}</p>
            {trend && (
              <span
                className={cn(
                  'text-sm font-medium',
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                )}
              >
                {trend.isPositive ? '+' : '-'}
                {Math.abs(trend.value)}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
        <div className={cn('p-3 rounded-lg', styles.icon)}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
