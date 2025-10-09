"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useCreateTask } from "@/hooks/use-task";
import { useOrgEvents } from "@/hooks/use-event";
import { useTeamMembers } from "@/hooks/use-team";
import { TaskPriority, TaskStatus } from "@/type";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    teamId: number;
    orgId: number;
    onTaskCreated: () => void;
}

export const CreateTaskModal = ({ 
    isOpen, 
    onClose, 
    teamId, 
    orgId, 
    onTaskCreated 
}: CreateTaskModalProps) => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        priority: "medium" as TaskPriority,
        status: "pending" as TaskStatus,
        dueDate: undefined as Date | undefined,
        eventId: "",
        userIds: [] as number[]
    });

    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    // Popover will be uncontrolled (simpler, matches shadcn example)

    const createTaskMutation = useCreateTask();
    const { data: events, isLoading: eventsLoading } = useOrgEvents(orgId);
    const { data: members, isLoading: membersLoading } = useTeamMembers(teamId);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData({
                title: "",
                description: "",
                priority: "medium",
                status: "pending",
                dueDate: undefined,
                eventId: "",
                userIds: []
            });
            setSelectedEventId(null);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.error("Title is required");
            return;
        }

        if (!formData.dueDate) {
            toast.error("Due date is required");
            return;
        }

        try {
            await createTaskMutation.mutateAsync({
                eventId: selectedEventId || 0,
                teamId,
                orgId,
                title: formData.title.trim(),
                description: formData.description.trim() || undefined,
                priority: formData.priority,
                status: formData.status,
                dueDate: formData.dueDate.toISOString(),
                userIds: formData.userIds
            });

            onTaskCreated();
            onClose();
            toast.success("Task created successfully!");
        } catch (error) {
            console.error("Error creating task:", error);
        }
    };

    const handleUserToggle = (userId: number) => {
        setFormData(prev => ({
            ...prev,
            userIds: prev.userIds.includes(userId)
                ? prev.userIds.filter(id => id !== userId)
                : [...prev.userIds, userId]
        }));
    };

    const handleEventChange = (eventId: string) => {
        const id = eventId === "none" ? null : parseInt(eventId);
        setSelectedEventId(id);
        setFormData(prev => ({ ...prev, eventId: eventId === "none" ? "" : eventId }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                    <DialogDescription>
                        Create a new task for your team. Fill in the details below.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6">
                        {/* Title */}
                        <div className="grid gap-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Enter task title"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Enter task description"
                                rows={3}
                            />
                        </div>

                        {/* Priority and Status - half width each */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2 flex-1">
                                <Label htmlFor="priority">Priority</Label>
                                <Select 
                                    value={formData.priority} 
                                    onValueChange={(value: TaskPriority) => setFormData(prev => ({ ...prev, priority: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="critical">Critical</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2 flex-1">
                                <Label htmlFor="status">Status</Label>
                                <Select 
                                    value={formData.status} 
                                    onValueChange={(value: TaskStatus) => setFormData(prev => ({ ...prev, status: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="overdue">Overdue</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Due Date using shadcn Calendar */}
                        <div className="grid gap-2">
                            <Label>Due Date *</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className={cn(
                                            "justify-start w-full pl-3 text-left font-normal",
                                            !formData.dueDate && "text-muted-foreground"
                                        )}
                                    >
                                        {formData.dueDate ? (
                                            format(formData.dueDate, "PPP")
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={formData.dueDate}
                                        onSelect={(date) => setFormData(prev => ({ ...prev, dueDate: date || undefined }))}
                                        // disable past dates (allow today and future)
                                        disabled={(date) => {
                                            const today = new Date();
                                            today.setHours(0,0,0,0);
                                            const d = new Date(date);
                                            d.setHours(0,0,0,0);
                                            return d < today;
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Event Selection */}
                        <div className="grid gap-2">
                            <Label htmlFor="event">Event (Optional)</Label>
                            <Select value={selectedEventId?.toString() || "none"} onValueChange={handleEventChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an event" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No Event</SelectItem>
                                    {eventsLoading ? (
                                        <SelectItem value="loading" disabled>Loading events...</SelectItem>
                                    ) : (
                                        events?.map((event) => (
                                            <SelectItem key={event.id} value={event.id.toString()}>
                                                {event.title}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* User Assignment from Team Members */}
                        <div className="grid gap-2">
                            <Label>Assign to Users (Optional)</Label>
                            <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                                {membersLoading ? (
                                    <div className="text-sm text-gray-500">Loading users...</div>
                                ) : members && members.length > 0 ? (
                                    <div className="space-y-2">
                                        {members.map((member: any) => {
                                            // member may be either a user or an object containing user
                                            const user = member?.user ?? member;
                                            return (
                                                <div key={user.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`user-${user.id}`}
                                                        checked={formData.userIds.includes(user.id)}
                                                        onCheckedChange={() => handleUserToggle(user.id)}
                                                    />
                                                    <Label 
                                                        htmlFor={`user-${user.id}`}
                                                        className="text-sm font-normal cursor-pointer"
                                                    >
                                                        {user.firstName} {user.lastName}
                                                        {user?.email ? ` (${user.email})` : ""}
                                                    </Label>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500">No users in this team</span>
                                        <Button type="button" variant="outline" size="sm" onClick={() => router.push(`/orgs/${orgId}/teams`)}>
                                            Add members
                                        </Button>
                                    </div>
                                )}
                            </div>
                            {formData.userIds.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {formData.userIds.map((userId) => {
                                        const user = members?.map((m: any) => m.user ?? m).find((u: any) => u.id === userId);
                                        return user ? (
                                            <Badge key={userId} variant="secondary" className="text-xs">
                                                {user.firstName} {user.lastName}
                                            </Badge>
                                        ) : null;
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createTaskMutation.isPending}>
                            {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
