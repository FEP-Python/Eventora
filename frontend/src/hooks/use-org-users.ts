"use client";

import axios from 'axios';
import { User } from '@/type';
import { useQuery } from '@tanstack/react-query';

interface ApiResponse<T> {
  data: T[];
}

// API function to get users in an organization
export const getOrgUsers = async (orgId: number): Promise<User[]> => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No authentication token found');

  const response = await axios.get<ApiResponse<User>>(
    `http://localhost:5000/api/org/users/${orgId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data.data;
};

// Custom hook
export const useOrgUsers = (orgId: number) => {
  return useQuery({
    queryKey: ['org', 'users', orgId],
    queryFn: () => getOrgUsers(orgId),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
