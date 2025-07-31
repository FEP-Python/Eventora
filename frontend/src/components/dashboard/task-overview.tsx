import Link from "next/link";
import { AlertTriangle, CheckSquare, Clock, MoreHorizontal, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";


export const TaskOverview = () => {
    const tasks = [
        {
            id: 1,
            title: "Book venue for Tech Symposium",
            assignee: "Sarah Chen",
            dueDate: "Mar 12",
            priority: "high",
            status: "in-progress",
            progress: 75,
        },
        {
            id: 2,
            title: "Design event posters",
            assignee: "Mike Johnson",
            dueDate: "Mar 14",
            priority: "medium",
            status: "pending",
            progress: 0,
        },
        {
            id: 3,
            title: "Send invitations to speakers",
            assignee: "Lisa Wang",
            dueDate: "Mar 10",
            priority: "high",
            status: "overdue",
            progress: 30,
        },
        {
            id: 4,
            title: "Prepare welcome kits",
            assignee: "David Brown",
            dueDate: "Mar 16",
            priority: "low",
            status: "completed",
            progress: 100,
        },
    ];

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high":
                return "bg-red-100 text-red-800 border-red-200"
            case "medium":
                return "bg-[#A3B18A]/20 text-[#3A5A40] border-[#A3B18A]/30"
            case "low":
                return "bg-[#588157]/20 text-[#3A5A40] border-[#588157]/30"
            default:
                return "bg-[#DAD7CD]/50 text-[#3A5A40] border-[#A3B18A]/30"
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "bg-[#588157]/20 text-[#3A5A40] border-[#588157]/30"
            case "in-progress":
                return "bg-[#A3B18A]/20 text-[#3A5A40] border-[#A3B18A]/30"
            case "pending":
                return "bg-[#DAD7CD]/50 text-[#3A5A40] border-[#A3B18A]/30"
            case "overdue":
                return "bg-red-100 text-red-800 border-red-200"
            default:
                return "bg-[#DAD7CD]/50 text-[#3A5A40] border-[#A3B18A]/30"
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "completed":
                return CheckSquare
            case "in-progress":
                return Clock
            case "overdue":
                return AlertTriangle
            default:
                return Clock
        }
    }

    return (
        <Card className="bg-white/80 backdrop-blur-sm border-[#A3B18A]/20">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center space-x-2 text-[#344E41]">
                            <CheckSquare className="h-5 w-5" />
                            <span className="font-semibold text-lg">Task Overview</span>
                        </CardTitle>
                        <CardDescription className="text-[#3A5A40]">Recent tasks and their progress</CardDescription>
                    </div>
                    <Link href="/dashboard/tasks">
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-[#A3B18A]/30 text-[#3A5A40] hover:bg-[#A3B18A]/10 bg-transparent"
                        >
                            View All Tasks
                        </Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {tasks.map((task) => {
                        const StatusIcon = getStatusIcon(task.status)
                        return (
                            <div
                                key={task.id}
                                className="border border-[#A3B18A]/20 rounded-lg p-4 hover:bg-[#DAD7CD]/20 transition-colors"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <StatusIcon className="h-4 w-4 text-[#588157]" />
                                            <h3 className="font-medium text-[#344E41]">{task.title}</h3>
                                        </div>
                                        <div className="flex items-center space-x-4 text-sm text-[#3A5A40]">
                                            <div className="flex items-center space-x-1">
                                                <User className="h-4 w-4" />
                                                <span>{task.assignee}</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <Clock className="h-4 w-4" />
                                                <span>Due {task.dueDate}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-[#3A5A40] hover:bg-[#DAD7CD]/30">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                                            <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                                        </div>
                                        <span className="text-sm text-[#3A5A40]">{task.progress}%</span>
                                    </div>
                                    <Progress value={task.progress} className="h-2" />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
