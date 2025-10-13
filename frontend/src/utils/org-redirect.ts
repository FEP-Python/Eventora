import { backend_api_url } from "@/constants";

export const clientOrgUtils = {
    // Check if user has any organizations (client-side only)
    async hasOrganizations(): Promise<boolean> {
      if (typeof window === 'undefined') return false;

      const token = localStorage.getItem('token');
      if (!token) return false;

      try {
        const [ownedResponse, memberResponse] = await Promise.all([
          fetch(`${backend_api_url}/user/owned-org`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
          fetch(`${backend_api_url}/user/member-org`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
        ]);

        if (!ownedResponse.ok || !memberResponse.ok) {
          return false;
        }

        const ownedData = await ownedResponse.json();
        const memberData = await memberResponse.json();

        const hasOwnedOrgs = ownedData.data && ownedData.data.length > 0;
        const hasMemberOrgs = memberData.data && memberData.data.length > 0;

        return hasOwnedOrgs || hasMemberOrgs;
      } catch (error) {
        console.error('Error checking organizations:', error);
        return false;
      }
    },

    // Get all organizations (client-side only)
    async getAllOrganizations() {
      if (typeof window === 'undefined') return { ownedOrgs: [], memberOrgs: [], hasOrganizations: false };

      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      try {
        const [ownedResponse, memberResponse] = await Promise.all([
          fetch('${backend_api_url}/user/owned-org', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
          fetch('${backend_api_url}/user/member-org', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
        ]);

        if (!ownedResponse.ok || !memberResponse.ok) {
          throw new Error('Failed to fetch organizations');
        }

        const ownedData = await ownedResponse.json();
        const memberData = await memberResponse.json();

        const ownedOrgs = ownedData.data || [];
        const memberOrgs = memberData.data || [];
        const hasOrganizations = ownedOrgs.length > 0 || memberOrgs.length > 0;

        return {
          ownedOrgs,
          memberOrgs,
          hasOrganizations,
        };
      } catch (error) {
        console.error('Error fetching organizations:', error);
        throw error;
      }
    }
  };
