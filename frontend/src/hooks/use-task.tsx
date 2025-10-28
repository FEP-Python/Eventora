"use client";

import { Task, TaskPriority, TaskStatus } from "@/type";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { backend_api_url } from "@/constants";

interface CreateTaskRequest {
    eventId: number;
    teamId: number;
    orgId: number;
    title: string;
    description?: string;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate: string;
    userIds: number[];
}

interface UpdateTaskRequest {
    title?: string;
    description?: string;
    priority?: string;
    status?: string;
    dueDate?: string;
}

interface AssignTaskRequest {
    taskId: number;
    userIds: number[];
}

interface UnassignTaskRequest {
    taskId: number;
    userIds: number[];
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
const createTask = async (taskData: CreateTaskRequest) => {
    const response = await axios.post(`${backend_api_url}/task/create`, taskData, {
        headers: getAuthHeaders()
    });

    return {
        task: response.data.task as Task,
        message: response.data.message || "Task created successfully",
        assignedUserIds: response.data["Assigned User Ids"] || []
    };
};

const updateTask = async ({ id, ...updateData }: UpdateTaskRequest & { id: number }) => {
    const response = await axios.patch(`${backend_api_url}/task/update/${id}`, updateData, {
        headers: getAuthHeaders()
    });

    return {
        message: response.data.message || "Task updated successfully"
    };
};

const deleteTask = async (id: number) => {
    const response = await axios.delete<ApiResponse>(`${backend_api_url}/task/delete/${id}`, {
        headers: getAuthHeaders(),
    });

    return response.data.message;
};

const getTasksByEvent = async (eventId: number): Promise<Task[]> => {
    const response = await axios.get(`${backend_api_url}/task/event/${eventId}`, {
        headers: getAuthHeaders()
    });
    return response.data.data;
};

const getTasksByTeam = async (teamId: number): Promise<Task[]> => {
    const response = await axios.get(`${backend_api_url}/task/team/${teamId}`, {
        headers: getAuthHeaders()
    });
    return response.data.data;
};

const assignTask = async (assignData: AssignTaskRequest) => {
    const response = await axios.post(`${backend_api_url}/task/assign`, assignData, {
        headers: getAuthHeaders()
    });
    return {
        message: response.data.message || "Task assigned successfully",
        assignedUserIds: response.data.assigned_user_ids || []
    };
};

const unassignTask = async (unassignData: UnassignTaskRequest) => {
    const response = await axios.delete(`${backend_api_url}/task/unassign`, {
        headers: getAuthHeaders(),
        data: unassignData
    });
    return {
        message: response.data.message || "Task unassigned successfully",
        removedUserIds: response.data.removed_user_ids || []
    };
};

const updateStatus = async ({taskId, status}: { taskId: number, status: string }) => {
    const res = await axios.patch(`${backend_api_url}/task/update-status/${taskId}`, { status }, {
        headers: getAuthHeaders()
    });

    return {
        message: res.data.message || "Task status updated successfully",
    }
}

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
export const useCreateTask = () => {
    const queryClient = useQueryClient();
    const assignMutation = useAssignTask();

    return useMutation({
        mutationFn: createTask,
        onSuccess: async (data, variables) => {
            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ["tasks", "event", variables.eventId] });
            queryClient.invalidateQueries({ queryKey: ["tasks", "team", variables.teamId] });
            queryClient.invalidateQueries({ queryKey: ["tasks", "org", variables.orgId] });

            // If userIds were provided, assign them
            if (variables.userIds && variables.userIds.length > 0 && data.task?.id) {
                await assignMutation.mutateAsync({
                    taskId: data.task.id,
                    userIds: variables.userIds
                });
            }

            // Show success toast
            toast.success(data.message);
        },
        onError: (error: unknown) => {
            console.error("Error creating task:", error);
            const errorMessage = getErrorMessage(error) || "Failed to create task. Please try again.";
            toast.error(errorMessage);
        },
    });
};

export const useUpdateTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateTask,
        onSuccess: (data, variables) => {
            console.log("Update task success response:", data);

            // Remove the specific task from cache to force refetch
            queryClient.removeQueries({ queryKey: ["task", variables.id] });

            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ["tasks"] });

            toast.success(data.message);
        },
        onError: (error: unknown) => {
            console.error("Error updating task:", error);
            const errorMessage = getErrorMessage(error) || "Failed to update task. Please try again.";
            toast.error(errorMessage);
        },
    });
};

export const useDeleteTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteTask,
        onSuccess: (message, deletedId) => {
            // Remove from cache
            queryClient.removeQueries({ queryKey: ["task", deletedId] });

            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ["tasks"] });

            toast.success(message || "Task deleted successfully!");
        },
        onError: (error: unknown) => {
            console.error("Error deleting task:", error);
            const errorMessage = getErrorMessage(error) || "Failed to delete task. Please try again.";
            toast.error(errorMessage);
        },
    });
};

export const useAssignTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: assignTask,
        onSuccess: (data, variables) => {
            // Invalidate relevant queries to refresh the data
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.invalidateQueries({ queryKey: ["task", variables.taskId] });

            toast.success(data.message || "Task assigned successfully!");
        },
        onError: (error: unknown) => {
            const errorMessage = getErrorMessage(error) || "Failed to assign task. Please try again.";
            toast.error(errorMessage);
        },
    });
};

export const useUnassignTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: unassignTask,
        onSuccess: (data, variables) => {
            // Invalidate tasks queries to refresh the data
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.invalidateQueries({ queryKey: ["task", variables.taskId] });

            toast.success(data.message || "Task unassigned successfully!");
        },
        onError: (error: unknown) => {
            const errorMessage = getErrorMessage(error) || "Failed to unassign task. Please try again.";
            toast.error(errorMessage);
        },
    });
};

export const useUpdateTaskStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateStatus,
        onSuccess: (data, variables) => {
            // Invalidate tasks queries to refresh the data
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.invalidateQueries({ queryKey: ["task", variables.taskId] });

            toast.success(data.message || "Task status updated!");
        },
        onError: (error: unknown) => {
            const errorMessage = getErrorMessage(error) || "Failed to update task. Please try again.";
            toast.error(errorMessage);
        },
    });
};

// Query Hooks
export const useTasksByEvent = (eventId: number) => {
    return useQuery({
        queryKey: ["tasks", "event", eventId],
        queryFn: () => getTasksByEvent(eventId),
        enabled: !!eventId,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
};

export const useTasksByTeam = (teamId: number) => {
    return useQuery({
        queryKey: ["tasks", "team", teamId],
        queryFn: () => getTasksByTeam(teamId),
        enabled: !!teamId,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
};

// Utility Hooks
export const useTaskActions = (taskId: number) => {
    const updateMutation = useUpdateTask();
    const deleteMutation = useDeleteTask();
    const assignMutation = useAssignTask();
    const unassignMutation = useUnassignTask();

    const updateTask = (updateData: UpdateTaskRequest) => {
        updateMutation.mutate({ id: taskId, ...updateData });
    };

    const assignTask = (assignData: Omit<AssignTaskRequest, 'taskId'>) => {
        assignMutation.mutate({ taskId, ...assignData });
    };

    const unassignTask = (unassignData: Omit<UnassignTaskRequest, 'taskId'>) => {
        unassignMutation.mutate({ taskId, ...unassignData });
    };

    const deleteTask = () => {
        deleteMutation.mutate(taskId);
    };

    return {
        updateTask,
        assignTask,
        unassignTask,
        deleteTask,
        isUpdating: updateMutation.isPending,
        isAssigning: assignMutation.isPending,
        isUnassigning: unassignMutation.isPending,
        isDeleting: deleteMutation.isPending,
        updateError: updateMutation.error,
        assignError: assignMutation.error,
        unassignError: unassignMutation.error,
        deleteError: deleteMutation.error,
    };
};

// Combined hook for task management by event
export const useEventTaskManagement = (eventId: number) => {
    const createMutation = useCreateTask();
    const { data: tasks, isLoading, error, refetch } = useTasksByEvent(eventId);

    const createTask = (taskData: Omit<CreateTaskRequest, 'eventId'>) => {
        createMutation.mutate({ ...taskData, eventId });
    };

    return {
        tasks,
        isLoading,
        error,
        createTask,
        isCreating: createMutation.isPending,
        createError: createMutation.error,
        refetchTasks: refetch,
    };
};

// Combined hook for task management by team
export const useTeamTaskManagement = (teamId: number) => {
    const createMutation = useCreateTask();
    const { data: tasks, isLoading, error, refetch } = useTasksByTeam(teamId);

    const createTask = (taskData: Omit<CreateTaskRequest, 'teamId'>) => {
        createMutation.mutate({ ...taskData, teamId });
    };

    return {
        tasks,
        isLoading,
        error,
        createTask,
        isCreating: createMutation.isPending,
        createError: createMutation.error,
        refetchTasks: refetch,
    };
};
