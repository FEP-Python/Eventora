'use client';

import { UserRole } from '@/type';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const roleConfig = {
  leader: {
    label: 'Leader',
    className: 'bg-red-100 text-red-800 border-red-200',
    icon: '👑',
  },
  coleader: {
    label: 'Co-Leader',
    className: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: '⭐',
  },
  member: {
    label: 'Member',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: '👤',
  },
  volunteer: {
    label: 'Volunteer',
    className: 'bg-green-100 text-green-800 border-green-200',
    icon: '🤝',
  },
};

const sizeConfig = {
  sm: 'text-xs px-2 py-1',
  md: 'text-sm px-2.5 py-1.5',
  lg: 'text-base px-3 py-2',
};

export const RoleBadge = ({ role, className, size = 'md' }: RoleBadgeProps) => {
  const config = roleConfig[role];
  const sizeClass = sizeConfig[size];
  
  return (
    <Badge 
      className={cn(
        'inline-flex items-center gap-1 font-medium',
        config.className,
        sizeClass,
        className
      )}
    >
      <span className="text-xs">{config.icon}</span>
      {config.label}
    </Badge>
  );
};

interface RoleIndicatorProps {
  role: UserRole;
  showIcon?: boolean;
  className?: string;
}

export const RoleIndicator = ({ role, showIcon = true, className }: RoleIndicatorProps) => {
  const config = roleConfig[role];
  
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {showIcon && <span className="text-lg">{config.icon}</span>}
      <span className="font-medium text-gray-700">{config.label}</span>
    </div>
  );
};
