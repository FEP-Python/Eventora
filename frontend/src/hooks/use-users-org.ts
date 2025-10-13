import axios from 'axios';
import { Org } from '@/type';
import { useQuery } from '@tanstack/react-query';
import { backend_api_url } from '@/constants';

interface ApiResponse<T> {
  data: T[];
}

// API functions
export const getUserOwnedOrgs = async (): Promise<Org[]> => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No authentication token found');

  const response = await axios.get<ApiResponse<Org>>(
    `${backend_api_url}/user/owned-org`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data.data;
};

export const getUserMemberOrgs = async (): Promise<Org[]> => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No authentication token found');

  const response = await axios.get<ApiResponse<Org>>(
    `${backend_api_url}/user/member-org`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data.data;
};

// Custom hooks
export const useUserOwnedOrgs = () => {
  return useQuery({
    queryKey: ['user', 'owned-orgs'],
    queryFn: getUserOwnedOrgs,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUserMemberOrgs = () => {
  return useQuery({
    queryKey: ['user', 'member-orgs'],
    queryFn: getUserMemberOrgs,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Combined hook to get all organizations (owned + member)
export const useUserAllOrgs = () => {
  const { data: ownedOrgs = [], isLoading: ownedLoading, error: ownedError } = useUserOwnedOrgs();
  const { data: memberOrgs = [], isLoading: memberLoading, error: memberError } = useUserMemberOrgs();

  const isLoading = ownedLoading || memberLoading;
  const error = ownedError || memberError;

  // Combine and deduplicate organizations
  const allOrgs = [...ownedOrgs, ...memberOrgs].reduce((acc, org) => {
    if (!acc.find(existingOrg => existingOrg.id === org.id)) {
      acc.push(org);
    }
    return acc;
  }, [] as Org[]);

  return {
    data: allOrgs,
    isLoading,
    error,
    hasOrganizations: allOrgs.length > 0,
  };
};

// Hook specifically for checking if user has any organizations
export const useHasOrganizations = () => {
  const { data: allOrgs, isLoading, error } = useUserAllOrgs();

  return {
    hasOrganizations: (allOrgs || []).length > 0,
    organizationCount: (allOrgs || []).length,
    isLoading,
    error,
  };
};
