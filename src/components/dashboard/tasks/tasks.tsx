"use client";
import { useState } from "react";
import { Filter, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { ListView } from "./list-view";


export const Tasks = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState<"list" | "kanban">("list");

    const tasks = [
        {
            id: 1,
            title: "Book venue for Tech Symposium",
            description: "Contact and book the main auditorium for the upcoming tech symposium",
            assignee: {
                name: "Sarah Chen",
                avatar: "/placeholder.svg?height=32&width=32",
                initials: "SC",
            },
            dueDate: "2024-03-12",
            priority: "high",
            status: "in-progress",
            progress: 75,
            event: "Tech Symposium 2024",
            tags: ["venue", "booking"],
            comments: 3,
            attachments: 2,
        },
        {
            id: 2,
            title: "Design event posters",
            description: "Create promotional materials for the coding workshop",
            assignee: {
                name: "Mike Johnson",
                avatar: "/placeholder.svg?height=32&width=32",
                initials: "MJ",
            },
            dueDate: "2024-03-14",
            priority: "medium",
            status: "todo",
            progress: 0,
            event: "Coding Workshop",
            tags: ["design", "marketing"],
            comments: 1,
            attachments: 0,
        },
        {
            id: 3,
            title: "Send invitations to speakers",
            description: "Reach out to industry experts for keynote speeches",
            assignee: {
                name: "Lisa Wang",
                avatar: "/placeholder.svg?height=32&width=32",
                initials: "LW",
            },
            dueDate: "2024-03-10",
            priority: "high",
            status: "overdue",
            progress: 30,
            event: "Tech Symposium 2024",
            tags: ["speakers", "outreach"],
            comments: 5,
            attachments: 1,
        },
        {
            id: 4,
            title: "Prepare welcome kits",
            description: "Assemble welcome packages for event attendees",
            assignee: {
                name: "David Brown",
                avatar: "/placeholder.svg?height=32&width=32",
                initials: "DB",
            },
            dueDate: "2024-03-16",
            priority: "low",
            status: "completed",
            progress: 100,
            event: "Alumni Meetup",
            tags: ["preparation", "materials"],
            comments: 2,
            attachments: 0,
        },
        {
            id: 5,
            title: "Set up registration system",
            description: "Configure online registration for workshop participants",
            assignee: {
                name: "Alex Rodriguez",
                avatar: "/placeholder.svg?height=32&width=32",
                initials: "AR",
            },
            dueDate: "2024-03-15",
            priority: "medium",
            status: "in-review",
            progress: 90,
            event: "Coding Workshop",
            tags: ["registration", "system"],
            comments: 4,
            attachments: 3,
        },
    ];

    const filteredTasks = tasks.filter(
        (task) =>
            task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Tasks</h1>
                    <p className="text-gray-600">Manage and track your team&apos;s tasks</p>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1 bg-white rounded-lg p-1 border">
                        <Button
                            variant={viewMode === "kanban" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("kanban")}
                        >
                            Kanban
                        </Button>
                        <Button
                            variant={viewMode === "list" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("list")}
                        >
                            List
                        </Button>
                    </div>
                    <Button className="flex items-center">
                        <Plus className="h-4 w-4" />
                        <span>Add Task</span>
                    </Button>
                </div>
            </div>

            <div className="flex items-center space-x-4 mb-6">
                <div className="flex-1 max-w-md relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search tasks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-[#eeece7]"
                    />
                </div>
                <Button className="flex items-center">
                    <Filter className="h-4 w-4" />
                    <span>Filter</span>
                </Button>
            </div>

            {viewMode === "list" && (
                <ListView tasks={filteredTasks} />
            )}
        </div>
    );
}
