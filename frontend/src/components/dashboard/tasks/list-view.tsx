import { useState } from "react";
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Edit, MoreHorizontal, User, Trash2, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { Task, TaskPriority, TaskStatus } from "@/type"
import { useTaskActions } from "@/hooks/use-task"
import { toast } from "sonner"

interface ListViewProps {
    tasks: Task[];
    onTaskUpdate?: () => void;
    onTaskDelete?: () => void;
}

export const ListView = ({ tasks, onTaskUpdate, onTaskDelete }: ListViewProps) => {
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [editForm, setEditForm] = useState({
        title: "",
        description: "",
        priority: "medium" as TaskPriority,
        status: "pending" as TaskStatus,
        dueDate: ""
    });

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

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
        setEditForm({
            title: task.title,
            description: task.description || "",
            priority: task.priority,
            status: task.status,
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ""
        });
    }

    const handleSaveEdit = () => {
        if (!editingTask) return;

        const { updateTask } = useTaskActions(editingTask.id);
        
        updateTask({
            title: editForm.title,
            description: editForm.description,
            priority: editForm.priority,
            status: editForm.status,
            dueDate: editForm.dueDate ? new Date(editForm.dueDate).toISOString() : undefined
        });

        setEditingTask(null);
        onTaskUpdate?.();
    }

    const handleDeleteTask = (taskId: number) => {
        const { deleteTask } = useTaskActions(taskId);
        deleteTask();
        onTaskDelete?.();
    }

    const handleStatusChange = (taskId: number, newStatus: TaskStatus) => {
        const { updateTask } = useTaskActions(taskId);
        updateTask({ status: newStatus });
        onTaskUpdate?.();
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
                                                {task.priority}
                                            </Badge>
                                            <Badge className={getStatusColor(task.status)}>
                                                <div className="flex items-center space-x-1">
                                                    {getStatusIcon(task.status)}
                                                    <span>{task.status.replace("_", " ")}</span>
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
                                                <span>Event ID: {task.eventId}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEditTask(task)}>
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    onClick={() => handleStatusChange(task.id, "completed")}
                                                    disabled={task.status === "completed"}
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    Mark Complete
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    onClick={() => handleStatusChange(task.id, "in_progress")}
                                                    disabled={task.status === "in_progress"}
                                                >
                                                    <Clock className="h-4 w-4 mr-2" />
                                                    Start Progress
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    onClick={() => handleDeleteTask(task.id)}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
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

            {/* Edit Task Dialog */}
            <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Task</DialogTitle>
                        <DialogDescription>
                            Make changes to the task details below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={editForm.title}
                                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={editForm.description}
                                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="priority">Priority</Label>
                                <Select 
                                    value={editForm.priority} 
                                    onValueChange={(value: TaskPriority) => setEditForm(prev => ({ ...prev, priority: value }))}
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
                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <Select 
                                    value={editForm.status} 
                                    onValueChange={(value: TaskStatus) => setEditForm(prev => ({ ...prev, status: value }))}
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
                        <div className="grid gap-2">
                            <Label htmlFor="dueDate">Due Date</Label>
                            <Input
                                id="dueDate"
                                type="date"
                                value={editForm.dueDate}
                                onChange={(e) => setEditForm(prev => ({ ...prev, dueDate: e.target.value }))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingTask(null)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveEdit}>
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
