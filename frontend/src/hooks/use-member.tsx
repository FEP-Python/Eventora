"use client";

import { toast } from "sonner";
import axios, { AxiosError } from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface InviteMemberRequest {
    email: string;
    firstName: string;
    lastName: string;
    orgId: number;
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

// API Function
const inviteMember = async (memberData: InviteMemberRequest) => {
    const response = await axios.post("http://localhost:5000/api/org/invite-member", memberData, {
        headers: getAuthHeaders()
    });

    return {
        message: response.data.message || "Invitation sent successfully",
        data: response.data.data
    };
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

// Mutation Hook
export const useInviteMember = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: inviteMember,
        onSuccess: (data, variables) => {
            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ["teams", "org", variables.orgId] });
            queryClient.invalidateQueries({ queryKey: ["org", variables.orgId] });

            // Show success toast
            toast.success(data.message);
        },
        onError: (error: unknown) => {
            console.error("Error inviting member:", error);
            const errorMessage = getErrorMessage(error) || "Failed to send invitation. Please try again.";
            toast.error(errorMessage);
        },
    });
};