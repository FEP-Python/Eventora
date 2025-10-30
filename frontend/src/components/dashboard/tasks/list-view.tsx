'use client';

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useOrgId } from "@/hooks/use-org-id";
import { Button } from "@/components/ui/button";
import { EditTaskModal } from "./edit-task-modal";
import { DeleteTaskDialog } from "./delete-task-dialog";
import { Task, TaskPriority, TaskStatus } from "@/type";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Calendar,
    Edit,
    User,
    Trash2,
    CheckCircle,
    Clock,
    AlertCircle,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateTaskStatus } from "@/hooks/use-task";

interface ListViewProps {
    tasks: Task[];
    onTaskUpdate?: () => void;
    onTaskDelete?: () => void;
    isOrgAdmin?: boolean;
    isTeamAdmin?: boolean;
    currentUserId?: number;
}

export const ListView = ({
    tasks,
    isOrgAdmin = false,
    isTeamAdmin = false,
    currentUserId,
    onTaskUpdate,
}: ListViewProps) => {
    const orgId = useOrgId();
    const updateStatusMutation = useUpdateTaskStatus();
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [deletingTask, setDeletingTask] = useState<Task | null>(null);

    // const canModifyTask = (task: Task) => {
    //     if (isOrgAdmin || isTeamAdmin) return true;
    //     return task.assignees?.some((u) => u.id === currentUserId) || false;
    // };

    const getPriorityColor = (priority: TaskPriority) => {
        switch (priority) {
            case "critical":
                return "bg-red-100 text-red-800 border-red-200";
            case "high":
                return "bg-orange-100 text-orange-800 border-orange-200";
            case "medium":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "low":
                return "bg-green-100 text-green-800 border-green-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getStatusColor = (status: TaskStatus) => {
        switch (status) {
            case "completed":
                return "bg-green-100 text-green-800 border-green-200";
            case "in_progress":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "pending":
                return "bg-gray-100 text-gray-800 border-gray-200";
            case "overdue":
                return "bg-red-100 text-red-800 border-red-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getStatusIcon = (status: TaskStatus) => {
        switch (status) {
            case "completed":
                return <CheckCircle className="h-4 w-4" />;
            case "in_progress":
                return <Clock className="h-4 w-4" />;
            case "overdue":
                return <AlertCircle className="h-4 w-4" />;
            default:
                return <Clock className="h-4 w-4" />;
        }
    };

    const formatDate = (dateString: string | Date) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const isOverdue = (dueDate: string | Date, status: TaskStatus) => {
        if (status === "completed") return false;
        return (
            new Date(dueDate) < new Date() &&
            new Date(dueDate).toDateString() !== new Date().toDateString()
        );
    };

    const getTaskAssignmentBadge = (task: Task) => {
        if (!task.assignees || task.assignees.length === 0) {
            return (
                <Badge variant="outline" className="text-xs">
                    Unassigned
                </Badge>
            );
        }

        const isCurrentUserAssigned = task.assignees.some(
            (u) => u.id === currentUserId
        );

        const names = task.assignees.map((u) => u.name).join(", ");

        return (
            <div className="flex items-center space-x-1 text-sm text-gray-700">
                <User className="h-3 w-3" />
                <span className="truncate">
                    {isCurrentUserAssigned
                        ? "You"
                        : `Assigned to: ${names}`}
                </span>
            </div>
        );
    };

    const updateTaskStatus = (taskId: number, status: string) => {
        updateStatusMutation.mutate({ taskId: taskId, status: status.toUpperCase() });
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>
                                {isOrgAdmin
                                    ? "All Tasks"
                                    : isTeamAdmin
                                        ? "Team Tasks"
                                        : "My Tasks"}
                            </CardTitle>
                            <CardDescription>
                                {isOrgAdmin
                                    ? "Complete list of tasks across all teams"
                                    : isTeamAdmin
                                        ? "Tasks for your team"
                                        : "Tasks assigned to you"}
                            </CardDescription>
                        </div>
                        <Badge variant="secondary" className="text-sm">
                            {tasks.length} task{tasks.length !== 1 ? "s" : ""}
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="space-y-4">
                        {tasks.map((task) => {
                            const isMyTask = task.assignees?.some(
                                (u) => u.id === currentUserId
                            );

                            return (
                                <div
                                    key={task.id}
                                    className={`border rounded-lg p-4 transition-colors ${isMyTask
                                        ? "bg-blue-50/50 border-blue-200"
                                        : "hover:bg-gray-50"
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-2 flex-wrap">
                                                <h3 className="font-medium text-gray-900">
                                                    {task.title}
                                                </h3>

                                                {isMyTask && (
                                                    <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                                                        Your Task
                                                    </Badge>
                                                )}

                                                <Badge
                                                    variant="outline"
                                                    className={getPriorityColor(task.priority)}
                                                >
                                                    <span className="capitalize">{task.priority}</span>
                                                </Badge>

                                                <Badge
                                                    variant="outline"
                                                    className={getStatusColor(task.status)}
                                                >
                                                    <div className="flex items-center space-x-1">
                                                        {getStatusIcon(task.status)}
                                                        <span className="capitalize">
                                                            {task.status.replace("_", " ")}
                                                        </span>
                                                    </div>
                                                </Badge>

                                                {isOverdue(task.dueDate!, task.status) && (
                                                    <Badge variant="destructive" className="text-xs">
                                                        Overdue
                                                    </Badge>
                                                )}
                                            </div>

                                            {task.description && (
                                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                    {task.description}
                                                </p>
                                            )}

                                            <div className="flex items-center space-x-4 text-sm text-gray-500 flex-wrap gap-2">
                                                {(isOrgAdmin || isTeamAdmin) && (
                                                    <div className="flex items-center space-x-1">
                                                        {getTaskAssignmentBadge(task)}
                                                    </div>
                                                )}

                                                <div className="flex items-center space-x-1">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>Due {formatDate(task.dueDate!)}</span>
                                                </div>

                                                {task.eventId && (
                                                    <Badge variant="outline" className="text-xs">
                                                        Event #{task.eventId}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-x-2">
                                            {isOrgAdmin || isTeamAdmin ? (
                                                <>
                                                    <Button
                                                        size="icon"
                                                        variant="outline"
                                                        onClick={() => setEditingTask(task)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="destructive"
                                                        onClick={() => setDeletingTask(task)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            ) : (
                                                <Select
                                                    defaultValue={task.status}
                                                    onValueChange={(value: string) => updateTaskStatus(task.id, value)}
                                                >
                                                    <SelectTrigger className="w-[140px] text-sm">
                                                        <SelectValue placeholder="Change status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pending">Pending</SelectItem>
                                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                                        <SelectItem value="completed">Completed</SelectItem>
                                                        <SelectItem value="overdue">Overdue</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-3">
                                        <div className="flex items-center space-x-2">
                                            <Badge variant="outline" className="text-xs">
                                                Created: {formatDate(task.createdAt)}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                                            <span>ID: #{task.id}</span>
                                            <span>Team: {task.teamId}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {editingTask && (
                <EditTaskModal
                    isOpen={!!editingTask}
                    onClose={() => setEditingTask(null)}
                    task={editingTask}
                    orgId={Number(orgId)}
                    teamId={editingTask?.teamId || 0}
                    onTaskUpdated={() => {
                        setEditingTask(null);
                        onTaskUpdate?.();
                    }}
                />
            )}

            {deletingTask && (
                <DeleteTaskDialog
                    open={!!deletingTask}
                    onClose={() => setDeletingTask(null)}
                    taskId={deletingTask.id || 0}
                />
            )}
        </>
    );
};
