import { Calendar, MoreHorizontal } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { Task } from "./list-view"


interface KanbanViewProps {
    tasks: Task[];
}

export const KanbanView = ({ tasks }: KanbanViewProps) => {
    const columns = [
        { id: "todo", title: "To Do", tasks: tasks.filter((t) => t.status === "todo") },
        { id: "in-progress", title: "In Progress", tasks: tasks.filter((t) => t.status === "in-progress") },
        { id: "in-review", title: "In Review", tasks: tasks.filter((t) => t.status === "in-review") },
        { id: "completed", title: "Completed", tasks: tasks.filter((t) => t.status === "completed") },
        { id: "overdue", title: "Overdue", tasks: tasks.filter((t) => t.status === "overdue") },
    ];

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high":
                return "bg-red-100 text-red-800 border-red-200"
            case "medium":
                return "bg-yellow-100 text-yellow-800 border-yellow-200"
            case "low":
                return "bg-green-100 text-green-800 border-green-200"
            default:
                return "bg-gray-100 text-gray-800 border-gray-200"
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {columns.map((column) => (
                <div key={column.id} className="bg-gray-100 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">{column.title}</h3>
                        <Badge variant="secondary">{column.tasks.length}</Badge>
                    </div>

                    <div className="space-y-3">
                        {column.tasks.map((task) => (
                            <Card key={task.id} className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <h4 className="font-medium text-gray-900 text-sm leading-tight">{task.title}</h4>
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                            <MoreHorizontal className="h-3 w-3" />
                                        </Button>
                                    </div>

                                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>

                                    {/* Priority and Tags */}
                                    <div className="flex items-center space-x-1 mb-3">
                                        <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>{task.priority}</Badge>
                                        {task.tags.slice(0, 2).map((tag, index) => (
                                            <Badge key={index} variant="outline" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>

                                    {/* Progress */}
                                    {task.progress > 0 && (
                                        <div className="mb-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs text-gray-600">Progress</span>
                                                <span className="text-xs text-gray-600">{task.progress}%</span>
                                            </div>
                                            <Progress value={task.progress} className="h-1" />
                                        </div>
                                    )}

                                    {/* Event and Due Date */}
                                    <div className="space-y-2 mb-3">
                                        <div className="flex items-center space-x-1 text-xs text-gray-600">
                                            <Calendar className="h-3 w-3" />
                                            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="text-xs text-gray-600 truncate">Event: {task.event}</div>
                                    </div>

                                    {/* Assignee and Stats */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={task.assignee.avatar || "/placeholder.svg"} />
                                                <AvatarFallback className="text-xs">{task.assignee.initials}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-xs text-gray-600 truncate">{task.assignee.name}</span>
                                        </div>

                                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                                            {task.comments > 0 && <span>{task.comments} 💬</span>}
                                            {task.attachments > 0 && <span>{task.attachments} 📎</span>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}
