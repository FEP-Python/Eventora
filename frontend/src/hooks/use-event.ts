import axios from "axios";
import { Event, EventStatus } from "@/type";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface CreateEventRequest {
    orgId: number;
    title: string;
    description?: string;
    startDate: string; // ISO string
    endDate: string; // ISO string
    registrationDeadline?: string | null; // ISO string
    capacity?: number | null;
    location: string;
    eventType: string;
    status?: "draft" | "planned" | "ongoing" | "completed" | "cancelled";
    isPublic?: boolean;
    registrationRequired?: boolean;
    entryFee?: number;
    certificateProvided?: boolean;
}

interface UpdateEventRequest {
    title: string;
    description?: string;
    startDate: string; // ISO string
    endDate: string; // ISO string
    registrationDeadline?: string; // ISO string
    capacity?: number;
    location: string;
    eventType: string;
    status?: EventStatus;
    isPublic?: boolean;
    registrationRequired?: boolean;
    entryFee?: number;
    certificateProvided?: boolean;
}

interface SearchEventsParams {
    title?: string;
    type?: string;
    status?: EventStatus;
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

// API Functions
const createEvent = async (eventData: CreateEventRequest) => {
    const response = await axios.post("http://localhost:5000/api/event/create", eventData, {
        headers: getAuthHeaders()
    });

    console.log("Create event API response: ", response);

    return {
        message: response.data.message || "Event created successfully",
        event: response.data.data
    };
};

const updateEvent = async ({ id, ...updateData }: UpdateEventRequest & { id: number }) => {
    const response = await axios.patch(`http://localhost:5000/api/event/update/${id}`, updateData, {
        headers: getAuthHeaders()
    });

    return {
        message: response.data.message || "Event updated successfully",
        event: response.data.data
    };
};

const deleteEvent = async (id: number) => {
    const response = await axios.delete<ApiResponse>(`http://localhost:5000/api/event/delete/${id}`, {
        headers: getAuthHeaders(),
    });

    return response.data.message;
};

const getEventById = async (id: number): Promise<Event> => {
    const response = await axios.get(`http://localhost:5000/api/event/get/${id}`, {
        headers: getAuthHeaders()
    });
    return response.data.data;
};

const getAllEventsByOrg = async (orgId: number): Promise<Event[]> => {
    const response = await axios.get(`http://localhost:5000/api/event/get-all/${orgId}`, {
        headers: getAuthHeaders()
    });
    return response.data.data;
};

const searchEvents = async (params: SearchEventsParams): Promise<Event[]> => {
    const searchParams = new URLSearchParams();
    if (params.title) searchParams.append('title', params.title);
    if (params.type) searchParams.append('type', params.type);
    if (params.status) searchParams.append('status', params.status);

    const response = await axios.get(`http://localhost:5000/api/event/search?${searchParams.toString()}`, {
        headers: getAuthHeaders()
    });
    return response.data.data;
};

const getUpcomingEvents = async (orgId: number): Promise<Event[]> => {
    const response = await axios.get(`http://localhost:5000/api/event/upcoming/${orgId}`);
    return response.data.data;
};

// Mutation Hooks
export const useCreateEvent = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createEvent,
        onSuccess: (data, variables) => {
            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ["events", "org", variables.orgId] });
            queryClient.invalidateQueries({ queryKey: ["events", "upcoming", variables.orgId] });
            queryClient.invalidateQueries({ queryKey: ["events", "search"] });

            // Show success toast
            toast.success(data.message);

            // Navigate to the event page if event data is available
            if (data.event?.id) {
                router.push(`/orgs/${variables.orgId}/events/${data.event.id}`);
            }
        },
        onError: (error: Error) => {
            console.error("Error creating event:", error);

            let errorMessage = "Failed to create event. Please try again.";

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

export const useUpdateEvent = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateEvent,
        onSuccess: (data, variables) => {
            console.log("Update event success response:", data);

            // Update the specific event in cache
            if (data?.event?.id) {
                queryClient.setQueryData(["event", data.event.id], data.event);
            }

            // Invalidate related queries
            if (data?.event?.orgId) {
                queryClient.invalidateQueries({ queryKey: ["events", "org", data.event.orgId] });
                queryClient.invalidateQueries({ queryKey: ["events", "upcoming", data.event.orgId] });
            }
            queryClient.invalidateQueries({ queryKey: ["events", "search"] });

            toast.success(data.message);

            // Navigate back to events list or stay on current page
            try {
                router.refresh();
            } catch (navigationError) {
                console.error("Navigation error:", navigationError);
            }
        },
        onError: (error: Error) => {
            console.error("Error updating event:", error);

            let errorMessage = "Failed to update event. Please try again.";

            if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error?.message) {
                errorMessage = error.message;
            }

            toast.error(errorMessage);
        },
    });
};

export const useDeleteEvent = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteEvent,
        onSuccess: (message, deletedId) => {
            // Remove from cache
            queryClient.removeQueries({ queryKey: ["event", deletedId] });

            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ["events"] });

            toast.success(message || "Event deleted successfully!");

            try {
                router.push("/dashboard");
            } catch (navigationError) {
                console.error("Navigation error:", navigationError);
            }
        },
            onError: (error: Error) => {
            console.error("Error deleting event:", error);

            let errorMessage = "Failed to delete event. Please try again.";

            if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error?.message) {
                errorMessage = error.message;
            }

            toast.error(errorMessage);
        },
    });
};

// Query Hooks
export const useEvent = (id: number) => {
    return useQuery({
        queryKey: ["event", id],
        queryFn: () => getEventById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useOrgEvents = (orgId: number) => {
    return useQuery({
        queryKey: ["events", "org", orgId],
        queryFn: () => getAllEventsByOrg(orgId),
        enabled: !!orgId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useSearchEvents = (params: SearchEventsParams, enabled: boolean = false) => {
    return useQuery({
        queryKey: ["events", "search", params],
        queryFn: () => searchEvents(params),
        enabled: enabled && (!!params.title || !!params.type || !!params.status),
        staleTime: 2 * 60 * 1000, // 2 minutes for search results
    });
};

export const useUpcomingEvents = (orgId: number) => {
    return useQuery({
        queryKey: ["events", "upcoming", orgId],
        queryFn: () => getUpcomingEvents(orgId),
        enabled: !!orgId,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
};

// Utility Hooks
export const useEventActions = (eventId: number) => {
    const updateMutation = useUpdateEvent();
    const deleteMutation = useDeleteEvent();
    const { data: event, isLoading, error } = useEvent(eventId);

    const updateEvent = (updateData: UpdateEventRequest) => {
        updateMutation.mutate({ id: eventId, ...updateData });
    };

    const deleteEvent = () => {
        deleteMutation.mutate(eventId);
    };

    return {
        event,
        isLoading,
        error,
        updateEvent,
        deleteEvent,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
        updateError: updateMutation.error,
        deleteError: deleteMutation.error,
    };
};

// Combined hook for organization event management
export const useOrgEventManagement = (orgId: number) => {
    const createMutation = useCreateEvent();
    const { data: events, isLoading, error, refetch } = useOrgEvents(orgId);
    const { data: upcomingEvents, isLoading: isLoadingUpcoming } = useUpcomingEvents(orgId);

    const createEvent = (eventData: Omit<CreateEventRequest, 'orgId'>) => {
        createMutation.mutate({ ...eventData, orgId });
    };

    return {
        events,
        upcomingEvents,
        isLoading,
        isLoadingUpcoming,
        error,
        createEvent,
        isCreating: createMutation.isPending,
        createError: createMutation.error,
        refetchEvents: refetch,
    };
};