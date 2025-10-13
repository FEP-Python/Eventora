'use client';

import { AccessLevel } from '@/type';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AccessLevelIndicatorProps {
  level: AccessLevel;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const accessLevelConfig = {
  none: {
    label: 'No Access',
    className: 'bg-gray-100 text-gray-600 border-gray-200',
    icon: '🚫',
  },
  read: {
    label: 'Read Only',
    className: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: '👁️',
  },
  write: {
    label: 'Read & Write',
    className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: '✏️',
  },
  admin: {
    label: 'Full Access',
    className: 'bg-red-100 text-red-700 border-red-200',
    icon: '🔑',
  },
};

const sizeConfig = {
  sm: 'text-xs px-2 py-1',
  md: 'text-sm px-2.5 py-1.5',
  lg: 'text-base px-3 py-2',
};

export const AccessLevelIndicator = ({ 
  level, 
  className, 
  size = 'md', 
  showIcon = true 
}: AccessLevelIndicatorProps) => {
  const config = accessLevelConfig[level];
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
      {showIcon && <span className="text-xs">{config.icon}</span>}
      {config.label}
    </Badge>
  );
};

interface PermissionListProps {
  permissions: string[];
  className?: string;
  maxItems?: number;
}

export const PermissionList = ({ permissions, className, maxItems = 5 }: PermissionListProps) => {
  const displayPermissions = maxItems ? permissions.slice(0, maxItems) : permissions;
  const hasMore = maxItems && permissions.length > maxItems;
  
  return (
    <div className={cn('space-y-1', className)}>
      {displayPermissions.map((permission, index) => (
        <div 
          key={index}
          className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded"
        >
          {permission}
        </div>
      ))}
      {hasMore && (
        <div className="text-xs text-gray-500 italic">
          +{permissions.length - maxItems} more...
        </div>
      )}
    </div>
  );
};
