"use client";

import { Team } from "@/type";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface CreateTeamRequest {
    orgId: number;
    name: string;
    description?: string;
}

interface UpdateTeamRequest {
    name: string;
    description?: string;
}

interface UpdateTeamLeaderRequest {
    leaderId: number;
}

interface AddMemberToTeamRequest {
    memberId: number;
}

interface RemoveMemberFromTeamRequest {
    memberId: number;
}

interface ApiResponse {
    message: string;
}

interface ApiErrorResponse {
    message: string;
}

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");

    return {
        Authorization: `Bearer ${token}`,
    };
};

// API Functions
const createTeam = async (teamData: CreateTeamRequest) => {
    const response = await axios.post("http://localhost:5000/api/team/create", teamData, {
        headers: getAuthHeaders()
    });

    console.log("Create team API response: ", response);

    return {
        message: response.data.message || "Team created successfully",
        team: response.data.data
    };
};

const updateTeam = async ({ id, ...updateData }: UpdateTeamRequest & { id: number }) => {
    const response = await axios.patch(`http://localhost:5000/api/team/update/${id}`, updateData, {
        headers: getAuthHeaders()
    });

    return {
        message: response.data.message || "Team updated successfully",
        team: response.data.data
    };
};

const deleteTeam = async (id: number) => {
    const response = await axios.delete<ApiResponse>(`http://localhost:5000/api/team/delete/${id}`, {
        headers: getAuthHeaders(),
    });

    return response.data.message;
};

const getTeamById = async (id: number): Promise<Team> => {
    const response = await axios.get(`http://localhost:5000/api/team/get/${id}`, {
        headers: getAuthHeaders()
    });
    return response.data.data;
};

export const getAllTeamsByOrg = async (orgId: number): Promise<Team[]> => {
    const response = await axios.get(`http://localhost:5000/api/team/get-all/${orgId}`, {
        headers: getAuthHeaders()
    });
    return response.data.data;
};

const updateTeamLeader = async ({ id, ...updateData }: UpdateTeamLeaderRequest & { id: number }) => {
    const response = await axios.patch(`http://localhost:5000/api/team/update-leader/${id}`, updateData, {
        headers: getAuthHeaders()
    });
    return response.data; // Return the full response data, not just response.data.data
};

const addMemberToTeam = async ({ id, ...updateData }: AddMemberToTeamRequest & { id: number }) => {
    const response = await axios.post(`http://localhost:5000/api/team/add-member/${id}`, updateData, {
        headers: getAuthHeaders()
    });
    return response.data; // Return the full response data, not just response.data.data
};

const removeMemberFromTeam = async ({ id, ...updateData }: RemoveMemberFromTeamRequest & { id: number }) => {
    const response = await axios.delete(`http://localhost:5000/api/team/remove-member/${id}`, {
        headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
        },
        data: updateData // Send memberId in the request body
    });
    return response.data; // Return the full response data, not just response.data.data
};

const getTeamMembers = async (id: number) => {
    const response = await axios.get(`http://localhost:5000/api/team/members/${id}`, {
        headers: getAuthHeaders()
    });
    console.log('Res from backend for members: ', response);
    return response.data.data;
};

// Helper function to extract error message
const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        if (axiosError.response?.data?.message) {
            return axiosError.response.data.message;
        }
        if (axiosError.message) {
            return axiosError.message;
        }
    }

    if (error instanceof Error) {
        return error.message;
    }

    return "An unexpected error occurred";
};

// Mutation Hooks
export const useCreateTeam = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createTeam,
        onSuccess: (data, variables) => {
            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ["teams", "org", variables.orgId] });
            queryClient.invalidateQueries({ queryKey: ["teams", "search"] });

            // Show success toast
            toast.success(data.message);

            // Navigate to the team page if team data is available
            if (data.team?.id) {
                router.push(`/orgs/${variables.orgId}/teams/${data.team.id}`);
            }
        },
        onError: (error: unknown) => {
            console.error("Error creating team:", error);
            const errorMessage = getErrorMessage(error) || "Failed to create team. Please try again.";
            toast.error(errorMessage);
        },
    });
};

export const useUpdateTeam = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateTeam,
        onSuccess: (data, variables) => {
            console.log("Update team success response:", data);

            // Update the specific event in cache
            if (data?.team?.id) {
                queryClient.setQueryData(["team", data.team.id], data.team);
            }

            // Invalidate related queries
            if (data?.team?.orgId) {
                queryClient.invalidateQueries({ queryKey: ["teams", "org", data.team.orgId] });
            }
            queryClient.invalidateQueries({ queryKey: ["teams", "search"] });

            toast.success(data.message);

            // Navigate back to events list or stay on current page
            try {
                router.refresh();
            } catch (navigationError) {
                console.error("Navigation error:", navigationError);
            }
        },
        onError: (error: unknown) => {
            console.error("Error updating team:", error);
            const errorMessage = getErrorMessage(error) || "Failed to update team. Please try again.";
            toast.error(errorMessage);
        },
    });
};

export const useDeleteTeam = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteTeam,
        onSuccess: (message, deletedId) => {
            // Remove from cache
            queryClient.removeQueries({ queryKey: ["team", deletedId] });

            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ["teams"] });

            toast.success(message || "Team deleted successfully!");
        },
        onError: (error: unknown) => {
            console.error("Error deleting team:", error);
            const errorMessage = getErrorMessage(error) || "Failed to delete team. Please try again.";
            toast.error(errorMessage);
        },
    });
};

export const useUpdateTeamLeader = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateTeamLeader,
        onSuccess: (data, variables) => {
            // Invalidate relevant queries to refresh the data
            queryClient.invalidateQueries({ queryKey: ["teams", "org"] });
            queryClient.invalidateQueries({ queryKey: ["team", variables.id] });
            queryClient.invalidateQueries({ queryKey: ["teams", "members"] });

            toast.success(data.message || "Team leader updated successfully!");
        },
        onError: (error: unknown) => {
            const errorMessage = getErrorMessage(error) || "Failed to update team leader. Please try again.";
            toast.error(errorMessage);
        },
    });
};

export const useAddMemberToTeam = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addMemberToTeam,
        onSuccess: (data, variables) => {
            // Invalidate the correct teams queries to refresh the data
            queryClient.invalidateQueries({ queryKey: ["teams", "org"] });
            queryClient.invalidateQueries({ queryKey: ["team", variables.id] });
            // Also invalidate any team-specific queries
            queryClient.invalidateQueries({ queryKey: ["teams", "members"] });
        },
        onError: (error: unknown) => {
            const errorMessage = getErrorMessage(error) || "Failed to add member to team. Please try again.";
            toast.error(errorMessage);
        },
    });
};

export const useRemoveMemberFromTeam = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: removeMemberFromTeam,
        onSuccess: (data, variables) => {
            // Invalidate teams queries to refresh the data
            queryClient.invalidateQueries({ queryKey: ["teams", "org"] });
            queryClient.invalidateQueries({ queryKey: ["team", variables.id] });
            queryClient.invalidateQueries({ queryKey: ["teams", "members"] });
        },
        onError: (error: unknown) => {
            const errorMessage = getErrorMessage(error) || "Failed to remove member from team. Please try again.";
            toast.error(errorMessage);
        },
    });
};

// Query Hooks
export const useTeam = (id: number) => {
    return useQuery({
        queryKey: ["team", id],
        queryFn: () => getTeamById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useOrgTeams = (orgId: number) => {
    return useQuery({
        queryKey: ["teams", "org", orgId],
        queryFn: () => getAllTeamsByOrg(orgId),
        enabled: !!orgId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useTeamMembers = (teamId: number) => {
    return useQuery({
        queryKey: ["teams", "org", teamId],
        queryFn: () => getTeamMembers(teamId),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// Utility Hooks
export const useTeamActions = (teamId: number) => {
    const updateMutation = useUpdateTeam();
    const deleteMutation = useDeleteTeam();
    const updateLeaderMutation = useUpdateTeamLeader();
    const addMemberMutation = useAddMemberToTeam();
    const removeMemberFromTeamMutation = useRemoveMemberFromTeam();
    const { data: team, isLoading, error } = useTeam(teamId);

    const updateTeam = (updateData: UpdateTeamRequest) => {
        updateMutation.mutate({ id: teamId, ...updateData });
    };

    const updateTeamLeader = (updateData: UpdateTeamLeaderRequest) => {
        updateLeaderMutation.mutate({ id: teamId, ...updateData });
    };

    const addMemberToTeam = (updateData: AddMemberToTeamRequest) => {
        addMemberMutation.mutate({ id: teamId, ...updateData });
    };

    const removeMemberFromTeam = (updateData: RemoveMemberFromTeamRequest) => {
        removeMemberFromTeamMutation.mutate({ id: teamId, ...updateData });
    };

    const deleteTeam = () => {
        deleteMutation.mutate(teamId);
    };

    return {
        team,
        isLoading,
        error,
        updateTeam,
        updateTeamLeader,
        addMemberToTeam,
        removeMemberFromTeam,
        deleteTeam,
        isUpdating: updateMutation.isPending,
        isUpdatingLeader: updateLeaderMutation.isPending,
        isAddingMember: addMemberMutation.isPending,
        isDeleting: deleteMutation.isPending,
        isRemovingMember: removeMemberFromTeamMutation.isPending,
        updateError: updateMutation.error,
        updateLeaderError: updateLeaderMutation.error,
        addMemberError: addMemberMutation.error,
        removeMemberError: removeMemberFromTeamMutation.error,
        deleteError: deleteMutation.error,
    };
};

// Combined hook for organization event management
export const useOrgTeamManagement = (orgId: number) => {
    const createMutation = useCreateTeam();
    const { data: teams, isLoading, error, refetch } = useOrgTeams(orgId);

    const createTeam = (teamData: Omit<CreateTeamRequest, 'orgId'>) => {
        createMutation.mutate({ ...teamData, orgId });
    };

    return {
        teams,
        isLoading,
        error,
        createTeam,
        isCreating: createMutation.isPending,
        createError: createMutation.error,
        refetchTeams: refetch,
    };
};
