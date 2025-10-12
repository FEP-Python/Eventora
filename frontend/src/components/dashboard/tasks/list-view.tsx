'use client';

import { useState } from "react";
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Edit, User, Trash2, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { Task, TaskPriority, TaskStatus } from "@/type"
import { EditTaskModal } from "./edit-task-modal";
import { useOrgId } from "@/hooks/use-org-id";
import { DeleteTaskDialog } from "./delete-task-dialog";

interface ListViewProps {
    tasks: Task[];
    onTaskUpdate?: () => void;
    onTaskDelete?: () => void;
}

export const ListView = ({ tasks }: ListViewProps) => {
    const orgId = useOrgId();
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [deletingTask, setDeletingTask] = useState<Task | null>(null);

    const getPriorityColor = (priority: TaskPriority) => {
        switch (priority) {
            case "critical":
                return "bg-red-100 text-red-800 border-red-200"
            case "high":
                return "bg-orange-100 text-orange-800 border-orange-200"
            case "medium":
                return "bg-yellow-100 text-yellow-800 border-yellow-200"
            case "low":
                return "bg-green-100 text-green-800 border-green-200"
            default:
                return "bg-gray-100 text-gray-800 border-gray-200"
        }
    }

    const getStatusColor = (status: TaskStatus) => {
        switch (status) {
            case "completed":
                return "bg-green-100 text-green-800"
            case "in_progress":
                return "bg-blue-100 text-blue-800"
            case "pending":
                return "bg-gray-100 text-gray-800"
            case "overdue":
                return "bg-red-100 text-red-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const getStatusIcon = (status: TaskStatus) => {
        switch (status) {
            case "completed":
                return <CheckCircle className="h-4 w-4" />
            case "in_progress":
                return <Clock className="h-4 w-4" />
            case "overdue":
                return <AlertCircle className="h-4 w-4" />
            default:
                return <Clock className="h-4 w-4" />
        }
    }

    const formatDate = (dateString: string | Date) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    }

    const isOverdue = (dueDate: string | Date) => {
        return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>All Tasks</CardTitle>
                    <CardDescription>Complete list of tasks across all projects</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {tasks.map((task) => (
                            <div key={task.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h3 className="font-medium text-gray-900">{task.title}</h3>
                                            <Badge className={getPriorityColor(task.priority)}>
                                                <span className="capitalize">{task.priority}</span>
                                            </Badge>
                                            <Badge className={getStatusColor(task.status)}>
                                                <div className="flex items-center space-x-1">
                                                    {getStatusIcon(task.status)}
                                                    <span className="capitalize">{task.status.replace("_", " ")}</span>
                                                </div>
                                            </Badge>
                                            {isOverdue(task.dueDate) && task.status !== "completed" && (
                                                <Badge variant="destructive">Overdue</Badge>
                                            )}
                                        </div>
                                        {task.description && (
                                            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                                        )}
                                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                                            {task.assigneeId && (
                                                <div className="flex items-center space-x-1">
                                                    <User className="h-4 w-4" />
                                                    <span>Assigned to User #{task.assigneeId}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center space-x-1">
                                                <Calendar className="h-4 w-4" />
                                                <span>Due {formatDate(task.dueDate)}</span>
                                            </div>
                                            {task.eventId && (
                                                <span>Event Id: {task.eventId}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-x-2">
                                        <Button size="icon" variant="outline" onClick={() => setEditingTask(task)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="destructive" onClick={() => setDeletingTask(task)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Badge variant="outline" className="text-xs">
                                            Created: {formatDate(task.createdAt)}
                                        </Badge>
                                        {task.updatedAt && (
                                            <Badge variant="outline" className="text-xs">
                                                Updated: {formatDate(task.updatedAt)}
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-3 text-sm text-gray-500">
                                        <span>ID: {task.id}</span>
                                        <span>Team: {task.teamId}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <EditTaskModal
                isOpen={!!editingTask}
                onClose={() => setEditingTask(null)}
                task={editingTask}
                orgId={Number(orgId)}
                teamId={editingTask?.teamId || 0}
                onTaskUpdated={() => {
                    setEditingTask(null);
                }}
            />
            <DeleteTaskDialog
                open={!!deletingTask}
                onClose={() => setDeletingTask(null)}
                taskId={deletingTask?.id || 0}
            />
        </>
    )
}
