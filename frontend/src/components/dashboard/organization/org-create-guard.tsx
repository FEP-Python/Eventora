'use client';

import { ReactNode } from 'react';
import { useRedirectIfHasOrganization } from '@/utils/org-client-guard';

interface OrgCreateGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function OrgCreateGuard({ children, fallback }: OrgCreateGuardProps) {
  const { hasOrganizations, isLoading } = useRedirectIfHasOrganization();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div>Loading...</div>
    </div>;
  }

  if (hasOrganizations) {
    return fallback || <div className="flex items-center justify-center min-h-screen">
      <div>You already have clubs. Redirecting...</div>
    </div>;
  }

  return <>{children}</>;
}
