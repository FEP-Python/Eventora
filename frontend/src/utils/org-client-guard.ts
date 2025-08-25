import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHasOrganizations } from '@/hooks/use-users-org';

// Hook for protecting pages that require organizations
export function useRequireOrganization(redirectTo: string = '/create-org') {
  const router = useRouter();
  const { hasOrganizations, isLoading, error } = useHasOrganizations();

  useEffect(() => {
    if (!isLoading && !error && !hasOrganizations) {
      router.push(redirectTo);
    }
  }, [hasOrganizations, isLoading, error, router, redirectTo]);

  return { hasOrganizations, isLoading, error };
}

// Hook for redirecting users who already have organizations away from org-create
export function useRedirectIfHasOrganization(redirectTo: string = '/dashboard') {
  const router = useRouter();
  const { hasOrganizations, isLoading } = useHasOrganizations();

  useEffect(() => {
    if (!isLoading && hasOrganizations) {
      router.push(redirectTo);
    }
  }, [hasOrganizations, isLoading, router, redirectTo]);

  return { hasOrganizations, isLoading };
}

// Hook for checking organization ownership
export function useCheckOrganizationAccess(requiredOrgId?: number) {
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      if (!requiredOrgId) {
        setHasAccess(true);
        setIsLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No authentication token');
          setIsLoading(false);
          return;
        }

        const [ownedResponse, memberResponse] = await Promise.all([
          fetch('http://localhost:5000/api/user/owned-org', {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
          fetch('http://localhost:5000/api/user/member-org', {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
        ]);

        if (!ownedResponse.ok || !memberResponse.ok) {
          setError('Failed to fetch organization data');
          setIsLoading(false);
          return;
        }

        const ownedData = await ownedResponse.json();
        const memberData = await memberResponse.json();

        const allOrgs = [...(ownedData.data || []), ...(memberData.data || [])];
        const hasAccessToOrg = allOrgs.some(org => org.id === requiredOrgId);

        setHasAccess(hasAccessToOrg);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [requiredOrgId]);

  return { hasAccess, isLoading, error };
}
