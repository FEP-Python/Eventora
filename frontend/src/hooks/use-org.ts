/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import axios from "axios";
import { Org, User, OrgRole, OrgStatistics, Team, Event, Task, Budget } from "@/type";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useOrgStore } from "./use-org-store";
import { backend_api_url } from "@/constants";

// ============================================================================
// TYPES
// ============================================================================

interface CreateOrgRequest {
  name: string;
  college: string;
  description?: string;
  contactEmail: string;
  contactPhone: string;
  website?: string;
}

interface UpdateOrgRequest {
  name?: string;
  college?: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
}

interface UpdateMemberRoleRequest {
  userId: number;
  role: OrgRole;
}

interface RemoveMemberRequest {
  userId: number;
}

interface TransferOwnershipRequest {
  newOwnerId: number;
}

interface OrgMember extends User {
  orgRole: OrgRole;
  joinedAt: string;
  isOwner: boolean;
}

interface OrgDetails {
  org: Org;
  userRole: OrgRole | null;
  isOwner: boolean;
  members: OrgMember[];
  teams: Team[];
  events: Event[];
  tasks: Task[];
  budgets: Budget[];
}

// interface SearchOrgsParams {
//   query: string;
// }

interface ApiResponse<T = any> {
  message: string;
  data?: T;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  return {
    Authorization: `Bearer ${token}`,
  };
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

// Create Organization
const createOrganization = async (orgData: CreateOrgRequest) => {
  const response = await axios.post(
    `${backend_api_url}/org/create`,
    orgData,
    {
      headers: getAuthHeaders(),
    }
  );

  return {
    message: response.data.message,
    org: response.data.data,
  };
};

// Update Organization
const updateOrganization = async ({
  id,
  ...updateData
}: UpdateOrgRequest & { id: number }) => {
  const res = await axios.patch(
    `${backend_api_url}/org/update/${id}`,
    updateData,
    {
      headers: getAuthHeaders(),
    }
  );
  return {
    message: res.data.message,
    org: res.data.data,
  };
};

// Delete Organization
const deleteOrganization = async (id: number) => {
  const res = await axios.delete<ApiResponse>(
    `${backend_api_url}/org/delete/${id}`,
    {
      headers: getAuthHeaders(),
    }
  );

  return res.data.message;
};

// Get Organization by ID
const getOrganizationById = async (id: number): Promise<Org> => {
  const response = await axios.get(`${backend_api_url}/org/get/${id}`, {
    headers: getAuthHeaders(),
  });
  return response.data.data;
};

// Get All Organizations
const getAllOrganizations = async (): Promise<Org[]> => {
  const res = await axios.get(`${backend_api_url}/org/get-all`, {
    headers: getAuthHeaders(),
  });
  return res.data.data;
};

// Get My Organizations
const getMyOrganizations = async (): Promise<Org[]> => {
  const response = await axios.get(`${backend_api_url}/org/my-organizations`, {
    headers: getAuthHeaders(),
  });
  return response.data.data;
};

// Join Organization
const joinOrganization = async (code: string) => {
  const response = await axios.post(
    `${backend_api_url}/org/join`,
    { code },
    { headers: getAuthHeaders() }
  );
  return {
    message: response.data.message,
    org: response.data.data,
  };
};

// Leave Organization
const leaveOrganization = async (orgId: number) => {
  const response = await axios.post(
    `${backend_api_url}/org/leave/${orgId}`,
    {},
    { headers: getAuthHeaders() }
  );
  return response.data.message;
};

// Get Organization Members
export const getOrganizationMembers = async (orgId: number): Promise<OrgMember[]> => {
  const response = await axios.get(
    `${backend_api_url}/org/members/${orgId}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data.data;
};

// Update Member Role
const updateMemberRole = async ({
  orgId,
  ...data
}: UpdateMemberRoleRequest & { orgId: number }) => {
  const response = await axios.patch(
    `${backend_api_url}/org/members/${orgId}/update-role`,
    data,
    { headers: getAuthHeaders() }
  );
  return {
    message: response.data.message,
    data: response.data.data,
  };
};

// Remove Member
const removeMember = async ({
  orgId,
  ...data
}: RemoveMemberRequest & { orgId: number }) => {
  const response = await axios.delete(
    `${backend_api_url}/org/members/${orgId}/remove`,
    {
      headers: getAuthHeaders(),
      data,
    }
  );
  return response.data.message;
};

// Search Organizations
const searchOrganizations = async (query: string): Promise<Org[]> => {
  const response = await axios.get(`${backend_api_url}/org/search`, {
    params: { q: query },
    headers: getAuthHeaders(),
  });
  return response.data.data;
};

// Get Organization Full Details
const getOrganizationDetails = async (orgId: number): Promise<OrgDetails> => {
  const response = await axios.get(`${backend_api_url}/org/details/${orgId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// Transfer Ownership
const transferOwnership = async ({
  orgId,
  ...data
}: TransferOwnershipRequest & { orgId: number }) => {
  const response = await axios.post(
    `${backend_api_url}/org/transfer-ownership/${orgId}`,
    data,
    { headers: getAuthHeaders() }
  );
  return {
    message: response.data.message,
    data: response.data.data,
  };
};

// Get Organization Statistics
export const getOrganizationStatistics = async (
  orgId: number
): Promise<OrgStatistics> => {
  const response = await axios.get(
    `${backend_api_url}/org/statistics/${orgId}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data.data;
};

// ============================================================================
// MUTATION HOOKS
// ============================================================================

export const useCreateOrg = () => {
  const router = useRouter();
  const { setActiveOrg } = useOrgStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrganization,
    onSuccess: (data) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["my-orgs"] });
      queryClient.invalidateQueries({ queryKey: ["orgs"] });

    //   toast.success(data.message || "Organization created successfully!");

      // Navigate to the organization page
      setActiveOrg(data.org);
      router.push(`/orgs/${data.org.id}`);
    },
    onError: (error) => {
      console.error("Error creating organization:", error);

      let errorMessage = "Failed to create organization. Please try again.";

      if (axios.isAxiosError(error)) {
        if (error?.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error?.message) {
          errorMessage = error.message;
        }
      }

      toast.error(errorMessage);
    },
  });
};

export const useUpdateOrg = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateOrganization,
    onSuccess: (data) => {
      if (data?.org?.id) {
        queryClient.setQueryData(["org", data.org.id], data.org);
        queryClient.invalidateQueries({ queryKey: ["org", data.org.id] });
        queryClient.invalidateQueries({ queryKey: ["org-details", data.org.id] });
      }

      queryClient.invalidateQueries({ queryKey: ["my-orgs"] });
      queryClient.invalidateQueries({ queryKey: ["orgs"] });

      toast.success(data.message || "Organization updated successfully!");
    },
    onError: (error: any) => {
      console.error("Error updating organization:", error);

      let errorMessage = "Failed to update organization. Please try again.";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    },
  });
};

export const useDeleteOrg = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteOrganization,
    onSuccess: (message, deletedId) => {
      queryClient.removeQueries({ queryKey: ["org", deletedId] });
      queryClient.removeQueries({ queryKey: ["org-details", deletedId] });
      queryClient.invalidateQueries({ queryKey: ["my-orgs"] });
      queryClient.invalidateQueries({ queryKey: ["orgs"] });

      toast.success(message || "Organization deleted successfully!");
      router.push("/dashboard");
    },
    onError: (error: any) => {
      console.error("Error deleting organization:", error);

      let errorMessage = "Failed to delete organization. Please try again.";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    },
  });
};

export const useJoinOrg = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: joinOrganization,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["my-orgs"] });
      queryClient.invalidateQueries({ queryKey: ["orgs"] });

      toast.success(data.message || "Successfully joined organization!");

      return data;
    },
    onError: (error: any) => {
      console.error("Error joining organization:", error);

      let errorMessage = "Failed to join organization. Please try again.";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    },
  });
};

export const useLeaveOrg = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leaveOrganization,
    onSuccess: (message, orgId) => {
      queryClient.removeQueries({ queryKey: ["org", orgId] });
      queryClient.removeQueries({ queryKey: ["org-details", orgId] });
      queryClient.invalidateQueries({ queryKey: ["my-orgs"] });
      queryClient.invalidateQueries({ queryKey: ["orgs"] });

      toast.success(message || "Left organization successfully!");
      router.push("/dashboard");
    },
    onError: (error: any) => {
      console.error("Error leaving organization:", error);

      let errorMessage = "Failed to leave organization. Please try again.";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    },
  });
};

export const useUpdateMemberRole = (orgId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateMemberRoleRequest) =>
      updateMemberRole({ orgId, ...data }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["org-members", orgId] });
      queryClient.invalidateQueries({ queryKey: ["org-details", orgId] });

      toast.success(data.message || "Member role updated successfully!");
    },
    onError: (error: any) => {
      console.error("Error updating member role:", error);

      let errorMessage = "Failed to update member role. Please try again.";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    },
  });
};

export const useRemoveMember = (orgId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RemoveMemberRequest) => removeMember({ orgId, ...data }),
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: ["org-members", orgId] });
      queryClient.invalidateQueries({ queryKey: ["org-details", orgId] });
      queryClient.invalidateQueries({ queryKey: ["org", orgId] });

      toast.success(message || "Member removed successfully!");
    },
    onError: (error: any) => {
      console.error("Error removing member:", error);

      let errorMessage = "Failed to remove member. Please try again.";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    },
  });
};

export const useTransferOwnership = (orgId: number) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: TransferOwnershipRequest) =>
      transferOwnership({ orgId, ...data }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["org", orgId] });
      queryClient.invalidateQueries({ queryKey: ["org-details", orgId] });
      queryClient.invalidateQueries({ queryKey: ["org-members", orgId] });
      queryClient.invalidateQueries({ queryKey: ["my-orgs"] });

      toast.success(data.message || "Ownership transferred successfully!");
      router.push("/dashboard");
    },
    onError: (error: any) => {
      console.error("Error transferring ownership:", error);

      let errorMessage = "Failed to transfer ownership. Please try again.";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    },
  });
};

// ============================================================================
// QUERY HOOKS
// ============================================================================

export const useOrg = (id: number) => {
  return useQuery({
    queryKey: ["org", id],
    queryFn: () => getOrganizationById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAllOrgs = () => {
  return useQuery({
    queryKey: ["orgs"],
    queryFn: getAllOrganizations,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useMyOrgs = () => {
  return useQuery({
    queryKey: ["my-orgs"],
    queryFn: getMyOrganizations,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useOrgMembers = (orgId: number) => {
  return useQuery({
    queryKey: ["org-members", orgId],
    queryFn: () => getOrganizationMembers(orgId),
    // enabled: !!orgId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useOrgDetails = (orgId: number) => {
  return useQuery({
    queryKey: ["org-details", orgId],
    queryFn: () => getOrganizationDetails(orgId),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSearchOrgs = (query: string) => {
  return useQuery({
    queryKey: ["search-orgs", query],
    queryFn: () => searchOrganizations(query),
    enabled: query.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useOrgStatistics = (orgId: number) => {
  return useQuery({
    queryKey: ["org-statistics", orgId],
    queryFn: () => getOrganizationStatistics(orgId),
    enabled: !!orgId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// ============================================================================
// UTILITY HOOKS
// ============================================================================

export const useOrgActions = (orgId: number) => {
  const updateMutation = useUpdateOrg();
  const deleteMutation = useDeleteOrg();
  const leaveMutation = useLeaveOrg();
  const { data: org, isLoading, error } = useOrg(orgId);

  const updateOrg = (updateData: UpdateOrgRequest) => {
    updateMutation.mutate({ id: orgId, ...updateData });
  };

  const deleteOrg = () => {
    deleteMutation.mutate(orgId);
  };

  const leaveOrg = () => {
    leaveMutation.mutate(orgId);
  };

  return {
    org,
    isLoading,
    error,
    updateOrg,
    deleteOrg,
    leaveOrg,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isLeaving: leaveMutation.isPending,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
    leaveError: leaveMutation.error,
  };
};

export const useOrgMemberActions = (orgId: number) => {
  const updateRoleMutation = useUpdateMemberRole(orgId);
  const removeMemberMutation = useRemoveMember(orgId);
  const { data: members, isLoading } = useOrgMembers(orgId);

  const updateRole = (userId: number, role: OrgRole) => {
    updateRoleMutation.mutate({ userId, role });
  };

  const removeMember = (userId: number) => {
    removeMemberMutation.mutate({ userId });
  };

  return {
    members,
    isLoading,
    updateRole,
    removeMember,
    isUpdatingRole: updateRoleMutation.isPending,
    isRemovingMember: removeMemberMutation.isPending,
    updateRoleError: updateRoleMutation.error,
    removeMemberError: removeMemberMutation.error,
  };
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const isOrgLeader = (org: Org | undefined, userRole: OrgRole | null) => {
  return userRole === "leader";
};

export const isOrgAdmin = (org: Org | undefined, userRole: OrgRole | null) => {
  return userRole === "leader" || userRole === "coleader";
};

export const isOrgMember = (org: Org | undefined, userRole: OrgRole | null) => {
  return !!userRole;
};

export const canUpdateOrg = (userRole: OrgRole | null) => {
  return userRole === "leader" || userRole === "coleader";
};

export const canDeleteOrg = (org: Org | undefined, userId: number) => {
  return org?.ownerId === userId;
};

export const canUpdateRoles = (userRole: OrgRole | null) => {
  return userRole === "leader";
};

export const canRemoveMembers = (userRole: OrgRole | null) => {
  return userRole === "leader" || userRole === "coleader";
};
