/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Team, User, OrgRole } from "@/type";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { backend_api_url } from "@/constants";

// ============================================================================
// TYPES
// ============================================================================

interface CreateTeamRequest {
    orgId: number;
    name: string;
    description?: string;
}

interface UpdateTeamRequest {
    name?: string;
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

interface TeamMember extends User {
    teamRole: OrgRole;
}

interface ApiResponse<T = any> {
    message: string;
    data?: T;
}

interface ApiErrorResponse {
    message: string;
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

// ============================================================================
// API FUNCTIONS
// ============================================================================

// Create Team
const createTeam = async (teamData: CreateTeamRequest) => {
    const response = await axios.post(
        `${backend_api_url}/team/create`,
        teamData,
        {
            headers: getAuthHeaders()
        }
    );

    return {
        message: response.data.message,
        team: response.data.data
    };
};

// Update Team
const updateTeam = async ({ id, ...updateData }: UpdateTeamRequest & { id: number }) => {
    const response = await axios.patch(
        `${backend_api_url}/team/update/${id}`,
        updateData,
        {
            headers: getAuthHeaders()
        }
    );

    return {
        message: response.data.message,
        team: response.data.data
    };
};

// Delete Team
const deleteTeam = async (id: number) => {
    const response = await axios.delete<ApiResponse>(
        `${backend_api_url}/team/delete/${id}`,
        {
            headers: getAuthHeaders(),
        }
    );

    return response.data.message;
};

// Get Team by ID
const getTeamById = async (id: number): Promise<Team> => {
    const response = await axios.get(
        `${backend_api_url}/team/get/${id}`,
        {
            headers: getAuthHeaders()
        }
    );
    return response.data.data;
};

// Get All Teams by Organization
export const getAllTeamsByOrg = async (orgId: number): Promise<Team[]> => {
    const response = await axios.get(
        `${backend_api_url}/team/get-all/${orgId}`,
        {
            headers: getAuthHeaders()
        }
    );
    return response.data.data;
};

// Update Team Leader
const updateTeamLeader = async ({ id, leaderId }: UpdateTeamLeaderRequest & { id: number }) => {
    const response = await axios.patch(
        `${backend_api_url}/team/update-leader/${id}`,
        { leaderId },
        {
            headers: getAuthHeaders()
        }
    );

    return {
        message: response.data.message,
        team: response.data.data
    };
};

// Update Team Member Role
const updateTeamMemberRole = async ({ id, memberId, role }: { id: number; memberId: number; role: OrgRole }) => {
    const response = await axios.patch(
        `${backend_api_url}/team/update-member-role/${id}`,
        { memberId, role },
        {
            headers: getAuthHeaders()
        }
    );

    return {
        message: response.data.message,
        data: response.data.data
    };
};

// Transfer Leadership
const transferLeadership = async ({ id, newLeaderId }: { id: number; newLeaderId: number }) => {
    const response = await axios.post(
        `${backend_api_url}/team/transfer-leadership/${id}`,
        { newLeaderId },
        {
            headers: getAuthHeaders()
        }
    );

    return {
        message: response.data.message,
        data: response.data.data
    };
};

// Add Member to Team
const addMemberToTeam = async ({ id, memberId }: AddMemberToTeamRequest & { id: number }) => {
    const response = await axios.post(
        `${backend_api_url}/team/add-member/${id}`,
        { memberId },
        {
            headers: getAuthHeaders()
        }
    );

    return {
        message: response.data.message,
        team: response.data.data
    };
};

// Remove Member from Team
const removeMemberFromTeam = async ({ id, memberId }: RemoveMemberFromTeamRequest & { id: number }) => {
    const response = await axios.delete(
        `${backend_api_url}/team/remove-member/${id}`,
        {
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            data: { memberId }
        }
    );

    return {
        message: response.data.message,
        team: response.data.data
    };
};

// Get Team Members
const getTeamMembers = async (id: number): Promise<TeamMember[]> => {
    const response = await axios.get(
        `${backend_api_url}/team/members/${id}`,
        {
            headers: getAuthHeaders()
        }
    );
    return response.data.data;
};

// ============================================================================
// MUTATION HOOKS
// ============================================================================

export const useCreateTeam = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createTeam,
        onSuccess: (data, variables) => {
            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ["teams", "org", variables.orgId] });
            queryClient.invalidateQueries({ queryKey: ["org-details", variables.orgId] });
            queryClient.invalidateQueries({ queryKey: ["dashboard", variables.orgId] });

            toast.success(data.message || "Team created successfully!");

            // Navigate to the team page if team data is available
            if (data.team?.id) {
                router.push(`/orgs/${variables.orgId}/teams/${data.team.id}`);
            }
        },
        onError: (error: unknown) => {
            console.error("Error creating team:", error);
            const errorMessage = getErrorMessage(error);
            toast.error(errorMessage);
        },
    });
};

export const useUpdateTeam = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateTeam,
        onSuccess: (data, variables) => {
            // Update the specific team in cache
            if (data?.team?.id) {
                queryClient.setQueryData(["team", data.team.id], data.team);
            }

            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ["team", variables.id] });

            if (data?.team?.orgId) {
                queryClient.invalidateQueries({ queryKey: ["teams", "org", data.team.orgId] });
                queryClient.invalidateQueries({ queryKey: ["org-details", data.team.orgId] });
            }

            toast.success(data.message || "Team updated successfully!");
        },
        onError: (error: unknown) => {
            console.error("Error updating team:", error);
            const errorMessage = getErrorMessage(error);
            toast.error(errorMessage);
        },
    });
};

export const useDeleteTeam = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteTeam,
        onSuccess: (message, deletedId) => {
            // Remove from cache
            queryClient.removeQueries({ queryKey: ["team", deletedId] });

            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ["teams"] });
            queryClient.invalidateQueries({ queryKey: ["org-details"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });

            toast.success(message || "Team deleted successfully!");
            router.back();
        },
        onError: (error: unknown) => {
            console.error("Error deleting team:", error);
            const errorMessage = getErrorMessage(error);
            toast.error(errorMessage);
        },
    });
};

export const useUpdateTeamLeader = (teamId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateTeamLeaderRequest) =>
            updateTeamLeader({ id: teamId, ...data }),
        onSuccess: (data) => {
            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ["team", teamId] });
            queryClient.invalidateQueries({ queryKey: ["team-members", teamId] });

            if (data?.team?.orgId) {
                queryClient.invalidateQueries({ queryKey: ["teams", "org", data.team.orgId] });
                queryClient.invalidateQueries({ queryKey: ["org-details", data.team.orgId] });
            }

            toast.success(data.message || "Team leader updated successfully!");
        },
        onError: (error: unknown) => {
            console.error("Error updating team leader:", error);
            const errorMessage = getErrorMessage(error);
            toast.error(errorMessage);
        },
    });
};

export const useUpdateTeamMemberRole = (teamId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { memberId: number; role: OrgRole }) =>
            updateTeamMemberRole({ id: teamId, ...data }),
        onSuccess: (data) => {
            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ["team", teamId] });
            queryClient.invalidateQueries({ queryKey: ["team-members", teamId] });

            if (data?.data?.team?.orgId) {
                queryClient.invalidateQueries({ queryKey: ["teams", "org", data.data.team.orgId] });
                queryClient.invalidateQueries({ queryKey: ["org-details", data.data.team.orgId] });
            }

            toast.success(data.message || "Member role updated successfully!");
        },
        onError: (error: unknown) => {
            console.error("Error updating member role:", error);
            const errorMessage = getErrorMessage(error);
            toast.error(errorMessage);
        },
    });
};

export const useTransferLeadership = (teamId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { newLeaderId: number }) =>
            transferLeadership({ id: teamId, ...data }),
        onSuccess: (data) => {
            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ["team", teamId] });
            queryClient.invalidateQueries({ queryKey: ["team-members", teamId] });

            if (data?.data?.team?.orgId) {
                queryClient.invalidateQueries({ queryKey: ["teams", "org", data.data.team.orgId] });
                queryClient.invalidateQueries({ queryKey: ["org-details", data.data.team.orgId] });
            }

            toast.success(data.message || "Leadership transferred successfully!");
        },
        onError: (error: unknown) => {
            console.error("Error transferring leadership:", error);
            const errorMessage = getErrorMessage(error);
            toast.error(errorMessage);
        },
    });
};

export const useAddMemberToTeam = (teamId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AddMemberToTeamRequest) =>
            addMemberToTeam({ id: teamId, ...data }),
        onSuccess: (data) => {
            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ["team", teamId] });
            queryClient.invalidateQueries({ queryKey: ["team-members", teamId] });

            if (data?.team?.orgId) {
                queryClient.invalidateQueries({ queryKey: ["teams", "org", data.team.orgId] });
                queryClient.invalidateQueries({ queryKey: ["org-details", data.team.orgId] });
            }

            toast.success(data.message || "Member added successfully!");
        },
        onError: (error: unknown) => {
            console.error("Error adding member:", error);
            const errorMessage = getErrorMessage(error);
            toast.error(errorMessage);
        },
    });
};

export const useRemoveMemberFromTeam = (teamId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: RemoveMemberFromTeamRequest) =>
            removeMemberFromTeam({ id: teamId, ...data }),
        onSuccess: (data) => {
            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ["team", teamId] });
            queryClient.invalidateQueries({ queryKey: ["team-members", teamId] });

            if (data?.team?.orgId) {
                queryClient.invalidateQueries({ queryKey: ["teams", "org", data.team.orgId] });
                queryClient.invalidateQueries({ queryKey: ["org-details", data.team.orgId] });
            }

            toast.success(data.message || "Member removed successfully!");
        },
        onError: (error: unknown) => {
            console.error("Error removing member:", error);
            const errorMessage = getErrorMessage(error);
            toast.error(errorMessage);
        },
    });
};

// ============================================================================
// QUERY HOOKS
// ============================================================================

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
        queryKey: ["team-members", teamId],
        queryFn: () => getTeamMembers(teamId),
        enabled: !!teamId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// ============================================================================
// UTILITY HOOKS
// ============================================================================

export const useTeamActions = (teamId: number) => {
    const updateMutation = useUpdateTeam();
    const deleteMutation = useDeleteTeam();
    const updateLeaderMutation = useUpdateTeamLeader(teamId);
    const addMemberMutation = useAddMemberToTeam(teamId);
    const removeMemberMutation = useRemoveMemberFromTeam(teamId);
    const { data: team, isLoading, error } = useTeam(teamId);

    const updateTeam = (updateData: UpdateTeamRequest) => {
        updateMutation.mutate({ id: teamId, ...updateData });
    };

    const updateLeader = (leaderId: number) => {
        updateLeaderMutation.mutate({ leaderId });
    };

    const addMember = (memberId: number) => {
        addMemberMutation.mutate({ memberId });
    };

    const removeMember = (memberId: number) => {
        removeMemberMutation.mutate({ memberId });
    };

    const deleteTeam = () => {
        deleteMutation.mutate(teamId);
    };

    return {
        team,
        isLoading,
        error,
        updateTeam,
        updateLeader,
        addMember,
        removeMember,
        deleteTeam,
        isUpdating: updateMutation.isPending,
        isUpdatingLeader: updateLeaderMutation.isPending,
        isAddingMember: addMemberMutation.isPending,
        isRemovingMember: removeMemberMutation.isPending,
        isDeleting: deleteMutation.isPending,
        updateError: updateMutation.error,
        updateLeaderError: updateLeaderMutation.error,
        addMemberError: addMemberMutation.error,
        removeMemberError: removeMemberMutation.error,
        deleteError: deleteMutation.error,
    };
};

// Combined hook for organization team management
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

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const isTeamLeader = (team: Team | undefined, userId: number) => {
    return team?.leaderId === userId;
};

export const isTeamMember = (team: Team | undefined, userId: number) => {
    return team?.members?.some(member => member.id === userId);
};

export const canUpdateTeam = (team: Team | undefined, userId: number) => {
    return isTeamLeader(team, userId);
};

export const canDeleteTeam = (team: Team | undefined, userId: number) => {
    return isTeamLeader(team, userId);
};

export const canManageMembers = (team: Team | undefined, userId: number) => {
    return isTeamLeader(team, userId);
};
