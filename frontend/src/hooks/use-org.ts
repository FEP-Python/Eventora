import axios from "axios";
import { Org, User } from "@/type";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useOrgStore } from "./use-org-store";

interface CreateOrgRequest {
  name: string;
  college: string;
  description?: string;
  contactEmail: string;
  contactPhone: string;
  website?: string;
}

interface UpdateOrgRequest {
  name: string;
  college: string;
  description?: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
}

interface ApiResponse {
  message: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  return {
    Authorization: `Bearer ${token}`,
  };
};

const createOrganization = async (orgData: CreateOrgRequest) => {
  const response = await axios.post(
    "http://localhost:5000/api/org/create",
    orgData,
    {
      headers: getAuthHeaders(),
    }
  );

  console.log("API response: ", response);

  // Return the exact response structure if not an array
  return {
    message: response.data[0].message,
    org: response.data[0].data,
  };
};

const updateOrganization = async ({
  id,
  ...updateData
}: UpdateOrgRequest & { id: number }) => {
  const res = await axios.patch(
    `http://localhost:5000/api/org/update/${id}`,
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

const deleteOrganization = async (id: number) => {
  const res = await axios.delete<ApiResponse>(
    `http://localhost:5000/api/org/delete/${id}`,
    {
      headers: getAuthHeaders(),
    }
  );

  return res.data.message;
};

const getOrganizationById = async (id: number): Promise<Org> => {
  const response = await axios.get(`http://localhost:5000/api/org/get/${id}`, {
    headers: getAuthHeaders(),
  });
  return response.data.data;
};

const getAllOrganizations = async (): Promise<Org[]> => {
  const res = await axios.get("http://localhost:5000/api/org/get-all", {
    headers: getAuthHeaders(),
  });
  return res.data.data;
};

const joinOrganization = async (code: string) => {
  const response = await axios.post(
    "http://localhost:5000/api/org/join",
    { code },
    { headers: getAuthHeaders() }
  );
  return response.data.data;
};

export const getOrganizationMembers = async (orgId: number): Promise<User[]> => {
  const response = await axios.get(
    `http://localhost:5000/api/org/members/${orgId}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data.data;
};

export const useCreateOrg = () => {
  const router = useRouter();
  const { setActiveOrg } = useOrgStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrganization,
    onSuccess: (data) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["user", "owned-orgs"] });
      queryClient.invalidateQueries({ queryKey: ["user", "member-orgs"] });
      queryClient.invalidateQueries({ queryKey: ["orgs"] });

      // Show success toast
      toast.success(data.message || "Club created successfully!");

      // Navigate to the organization page
      setActiveOrg(data.org);
      const orgId = data.org.id;
      router.push(`/orgs/${orgId}`);
    },
    onError: (error) => {
      console.error("Error creating club:", error);

      // Extract error message
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
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateOrganization,
    onSuccess: (updatedOrg) => {
      console.log("Update org success response:", updatedOrg); // Debug log

      if (updatedOrg?.org?.id) {
        queryClient.setQueryData(["org", updatedOrg.org.id], updatedOrg.org);
      }

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["user", "owned-orgs"] });
      queryClient.invalidateQueries({ queryKey: ["orgs"] });

      toast.success(updatedOrg.message || "Organization updated successfully!");

      try {
        router.push("/dashboard");
      } catch (navigationError) {
        console.error("Navigation error:", navigationError);
      }
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
      // Remove from cache
      queryClient.removeQueries({ queryKey: ["org", deletedId] });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["user", "owned-orgs"] });
      queryClient.invalidateQueries({ queryKey: ["orgs"] });

      toast.success(message || "Organization deleted successfully!");

      try {
        router.push("/dashboard");
      } catch (navigationError) {
        console.error("Navigation error:", navigationError);
      }
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
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["user", "owned-orgs"] });
      queryClient.invalidateQueries({ queryKey: ["user", "member-orgs"] });
      queryClient.invalidateQueries({ queryKey: ["orgs"] });

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

      // Don't throw the error here - let the mutation handle it
      // The error will be passed to the onError callback in your component
      console.error("Join organization error:", errorMessage);
    },
  });
};

// Query hooks
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

export const useOrgMembers = (orgId: number) => {
  return useQuery({
    queryKey: ["org", "members", orgId],
    queryFn: () => getOrganizationMembers(orgId),
    // enabled: !!orgId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Utility hooks
export const useOrgActions = (orgId: number) => {
  const updateMutation = useUpdateOrg();
  const deleteMutation = useDeleteOrg();
  const { data: org, isLoading, error } = useOrg(orgId);

  const updateOrg = (updateData: UpdateOrgRequest) => {
    updateMutation.mutate({ id: orgId, ...updateData });
  };

  const deleteOrg = () => {
    deleteMutation.mutate(orgId);
  };

  return {
    org,
    isLoading,
    error,
    updateOrg,
    deleteOrg,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
  };
};
