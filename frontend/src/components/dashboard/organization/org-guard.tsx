'use client';

import { useIsAuthenticated } from '@/hooks/use-auth';
import { useRequireOrganization } from '@/utils/org-client-guard';

interface OrganizationGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function OrganizationGuard({ children, fallback }: OrganizationGuardProps) {
  const { isAuthenticated } = useIsAuthenticated();
  const { hasOrganizations, isLoading, error } = useRequireOrganization();

  if(!isAuthenticated) {
    return <div className="flex items-center justify-center min-h-screen">
      <div>Redirecting to login...</div>
    </div>;
  }

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
