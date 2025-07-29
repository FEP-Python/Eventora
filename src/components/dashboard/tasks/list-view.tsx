import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Edit, MoreHorizontal, User } from "lucide-react"


type Task = {
    id: number;
    title: string;
    description: string;
    assignee: {
        name: string;
        avatar: string;
        initials: string;
    },
    dueDate: string;
    priority: string;
    status: string;
    progress: number;
    event: string;
    tags: string[];
    comments: number;
    attachments: number;
}

interface ListViewProps {
    tasks: Task[];
}

export const ListView = ({ tasks }: ListViewProps) => {
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "bg-green-100 text-green-800"
            case "in-progress":
                return "bg-blue-100 text-blue-800"
            case "in-review":
                return "bg-purple-100 text-purple-800"
            case "todo":
                return "bg-gray-100 text-gray-800"
            case "overdue":
                return "bg-red-100 text-red-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    return (
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
                                        <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                                        <Badge className={getStatusColor(task.status)}>{task.status.replace("-", " ")}</Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                        <div className="flex items-center space-x-1">
                                            <User className="h-4 w-4" />
                                            <span>{task.assignee.name}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Calendar className="h-4 w-4" />
                                            <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                                        </div>
                                        <span>Event: {task.event}</span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button variant="ghost" size="sm">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {task.progress > 0 && (
                                <div className="mb-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm text-gray-600">Progress</span>
                                        <span className="text-sm text-gray-600">{task.progress}%</span>
                                    </div>
                                    <Progress value={task.progress} className="h-2" />
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    {task.tags.map((tag, index) => (
                                        <Badge key={index} variant="outline" className="text-xs">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>

                                <div className="flex items-center space-x-3 text-sm text-gray-500">
                                    {task.comments > 0 && <span>{task.comments} comments</span>}
                                    {task.attachments > 0 && <span>{task.attachments} attachments</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
