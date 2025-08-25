'use client';

import { ReactNode } from 'react';
import { useRequireOrganization } from '@/utils/org-client-guard';

interface OrganizationGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function OrganizationGuard({ children, fallback }: OrganizationGuardProps) {
  const { hasOrganizations, isLoading, error } = useRequireOrganization();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div>Checking your clubs...</div>
    </div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-red-500">Error loading clubs. Please try again.</div>
    </div>;
  }

  if (!hasOrganizations) {
    return fallback || <div className="flex items-center justify-center min-h-screen">
      <div>Redirecting to club creation...</div>
    </div>;
  }

  return <>{children}</>;
}
