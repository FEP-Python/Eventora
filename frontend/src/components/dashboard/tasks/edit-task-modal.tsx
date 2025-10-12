"use client";
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateTask } from "@/hooks/use-task";
import { useOrgEvents } from "@/hooks/use-event";
import { Task } from "@/type";
import { toast } from "sonner";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface EditTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: Task | null;
    orgId: number;
    teamId: number;
    onTaskUpdated: () => void;
}

export const EditTaskModal = ({
    isOpen,
    onClose,
    task,
    orgId,
    teamId,
    onTaskUpdated
}: EditTaskModalProps) => {
    const [formData, setFormData] = useState({
        title: task?.title || "",
        description: task?.description || "",
        priority: (task?.priority || "medium") as string,
        status: (task?.status || "pending") as string,
        dueDate: task?.dueDate || undefined as Date | undefined,
        eventId: task?.eventId || "",
        userIds: task?.assignee ? [task.assignee.id] : [] as number[]
    });

    const [showCalendar, setShowCalendar] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const calendarRef = useRef<HTMLDivElement>(null);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Close calendar on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
                setShowCalendar(false);
            }
        };

        if (showCalendar) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showCalendar]);

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        return { daysInMonth, startingDayOfWeek };
    };

    const isDateDisabled = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    const isSameDay = (date1: Date | undefined, date2: Date) => {
        if (!date1 || !date2) return false;
        return (
            date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear()
        );
    };

    const handleDateSelect = (day: number) => {
        const selectedDate = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            day
        );

        if (!isDateDisabled(selectedDate)) {
            setFormData(prev => ({ ...prev, dueDate: selectedDate }));
            setShowCalendar(false);
        }
    };

    const navigateMonth = (direction: number) => {
        setCurrentMonth(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + direction);
            return newDate;
        });
    };

    const renderCalendar = () => {
        const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
        const days = [];

        // Empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(<div key={`empty-${i}`} className="h-9 w-9" />);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            const disabled = isDateDisabled(date);
            const selected = isSameDay(formData.dueDate, date);
            const isToday = isSameDay(new Date(), date);

            days.push(
                <button
                    key={day}
                    type="button"
                    onClick={() => handleDateSelect(day)}
                    disabled={disabled}
                    className={`
                        h-9 w-9 rounded-md text-sm font-medium transition-colors
                        ${disabled ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'}
                        ${selected ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                        ${isToday && !selected ? 'border border-blue-600' : ''}
                        ${!disabled && !selected ? 'text-gray-900' : ''}
                    `}
                >
                    {day}
                </button>
            );
        }

        return days;
    };

    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

    const updateTaskMutation = useUpdateTask();
    const { data: events, isLoading: eventsLoading } = useOrgEvents(orgId);

    // Populate form when task changes
    useEffect(() => {
        if (isOpen && task) {
            setFormData({
                title: task.title || "",
                description: task.description || "",
                priority: task.priority || "medium",
                status: task.status || "pending",
                dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
                eventId: task.eventId?.toString() || "",
                userIds: task.assigneeId ? [task.assigneeId] : []
            });
            setSelectedEventId(task.eventId || null);

            // Set calendar to task's due date month
            if (task.dueDate) {
                setCurrentMonth(new Date(task.dueDate));
            }
        }
    }, [isOpen, task]);

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

        if (!task) return;

        try {
            await updateTaskMutation.mutateAsync({
                id: task.id,
                title: formData.title.trim(),
                description: formData.description.trim() || undefined,
                priority: formData.priority,
                status: formData.status,
                dueDate: formData.dueDate.toISOString(),
            });

            onTaskUpdated();
            onClose();
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };

    const handleEventChange = (eventId: string) => {
        const id = eventId === "none" ? null : parseInt(eventId);
        setSelectedEventId(id);
        setFormData(prev => ({ ...prev, eventId: eventId === "none" ? "" : eventId }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Edit Task</DialogTitle>
                    <DialogDescription>
                        Update task details below.
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

                        {/* Priority and Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className=" flex flex-col gap-y-2">
                                <Label htmlFor="priority">Priority</Label>
                                <Select
                                    value={formData.priority}
                                    onValueChange={(value: string) => setFormData(prev => ({ ...prev, priority: value }))}
                                >
                                    <SelectTrigger className="w-full">
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
                                    onValueChange={(value: string) => setFormData(prev => ({ ...prev, status: value }))}
                                >
                                    <SelectTrigger className="w-full">
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

                        {/* Due Date */}
                        <div className="relative" ref={calendarRef}>
                            <Label htmlFor="due_date">Due Date *</Label>

                            <button
                                type="button"
                                id="due_date"
                                onClick={() => setShowCalendar(!showCalendar)}
                                className="w-full px-4 py-2 text-left border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors flex items-center justify-between mt-2"
                            >
                                <span className={formData.dueDate ? 'text-gray-900' : 'text-gray-400'}>
                                    {formData.dueDate
                                        ? formData.dueDate.toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })
                                        : 'Select due date'}
                                </span>
                                <Calendar className="h-5 w-5 text-gray-400" />
                            </button>

                            {/* Calendar Popup - positioned above */}
                            {showCalendar && (
                                <div className="absolute z-50 bottom-full mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80">
                                    {/* Calendar Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <button
                                            type="button"
                                            onClick={() => navigateMonth(-1)}
                                            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                                        >
                                            <ChevronLeft className="h-5 w-5 text-gray-600" />
                                        </button>

                                        <div className="text-sm font-semibold text-gray-900">
                                            {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => navigateMonth(1)}
                                            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                                        >
                                            <ChevronRight className="h-5 w-5 text-gray-600" />
                                        </button>
                                    </div>

                                    {/* Days of Week */}
                                    <div className="grid grid-cols-7 gap-1 mb-2">
                                        {daysOfWeek.map(day => (
                                            <div key={day} className="h-9 w-9 flex items-center justify-center text-xs font-medium text-gray-500">
                                                {day}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Calendar Days */}
                                    <div className="grid grid-cols-7 gap-1">
                                        {renderCalendar()}
                                    </div>
                                </div>
                            )}
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
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={updateTaskMutation.isPending}>
                            {updateTaskMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
