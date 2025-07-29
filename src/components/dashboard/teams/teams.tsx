"use client";

import { useState } from "react";
import { Filter, Plus, Search, UserPlus } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { TeamsGrid } from "./teams-grid";
import { AllMembers } from "./all-members";


export const Teams = () => {
    const [searchTerm, setSearchTerm] = useState("")

    const teams = [
        {
            id: 1,
            name: "Event Management",
            description: "Responsible for planning and executing all events",
            members: [
                {
                    id: 1,
                    name: "Sarah Chen",
                    email: "sarah@college.edu",
                    role: "Team Lead",
                    avatar: "/placeholder.svg?height=40&width=40",
                    initials: "SC",
                    joinDate: "2023-09-01",
                    skills: ["Project Management", "Event Planning"],
                    status: "active",
                },
                {
                    id: 2,
                    name: "Mike Johnson",
                    email: "mike@college.edu",
                    role: "Coordinator",
                    avatar: "/placeholder.svg?height=40&width=40",
                    initials: "MJ",
                    joinDate: "2023-10-15",
                    skills: ["Logistics", "Vendor Management"],
                    status: "active",
                },
                {
                    id: 3,
                    name: "Lisa Wang",
                    email: "lisa@college.edu",
                    role: "Member",
                    avatar: "/placeholder.svg?height=40&width=40",
                    initials: "LW",
                    joinDate: "2023-11-20",
                    skills: ["Communication", "Marketing"],
                    status: "active",
                },
            ],
            color: "bg-blue-100 text-blue-800",
            activeProjects: 3,
            completedTasks: 45,
        },
        {
            id: 2,
            name: "Marketing & Design",
            description: "Handles all promotional materials and branding",
            members: [
                {
                    id: 4,
                    name: "David Brown",
                    email: "david@college.edu",
                    role: "Team Lead",
                    avatar: "/placeholder.svg?height=40&width=40",
                    initials: "DB",
                    joinDate: "2023-08-15",
                    skills: ["Graphic Design", "Social Media"],
                    status: "active",
                },
                {
                    id: 5,
                    name: "Alex Rodriguez",
                    email: "alex@college.edu",
                    role: "Designer",
                    avatar: "/placeholder.svg?height=40&width=40",
                    initials: "AR",
                    joinDate: "2023-09-30",
                    skills: ["UI/UX", "Photography"],
                    status: "active",
                },
            ],
            color: "bg-purple-100 text-purple-800",
            activeProjects: 2,
            completedTasks: 32,
        },
        {
            id: 3,
            name: "Technical Support",
            description: "Manages technical aspects and equipment",
            members: [
                {
                    id: 6,
                    name: "Emma Wilson",
                    email: "emma@college.edu",
                    role: "Team Lead",
                    avatar: "/placeholder.svg?height=40&width=40",
                    initials: "EW",
                    joinDate: "2023-07-10",
                    skills: ["Audio/Visual", "IT Support"],
                    status: "active",
                },
                {
                    id: 7,
                    name: "James Taylor",
                    email: "james@college.edu",
                    role: "Technician",
                    avatar: "/placeholder.svg?height=40&width=40",
                    initials: "JT",
                    joinDate: "2023-10-05",
                    skills: ["Equipment Setup", "Troubleshooting"],
                    status: "active",
                },
                {
                    id: 8,
                    name: "Sophie Davis",
                    email: "sophie@college.edu",
                    role: "Member",
                    avatar: "/placeholder.svg?height=40&width=40",
                    initials: "SD",
                    joinDate: "2023-12-01",
                    skills: ["Live Streaming", "Recording"],
                    status: "inactive",
                },
            ],
            color: "bg-green-100 text-green-800",
            activeProjects: 1,
            completedTasks: 28,
        },
    ];

    const filteredTeams = teams.filter(
        (team) =>
            team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            team.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            team.members.some((member) => member.name.toLowerCase().includes(searchTerm.toLowerCase())),
    )

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Teams</h1>
                    <p className="text-gray-600">Manage your organization&apos;s teams and members</p>
                </div>
                <div className="flex items-center space-x-3">
                    <Button variant="outline" className="flex items-center">
                        <UserPlus className="h-4 w-4" />
                        <span>Invite Member</span>
                    </Button>
                    <Button variant="green" className="flex items-center">
                        <Plus className="h-4 w-4" />
                        <span>Create Team</span>
                    </Button>
                </div>
            </div>

            <div className="flex items-center space-x-4 mb-6">
                <div className="flex-1 max-w-md relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search teams and members..."
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

            <TeamsGrid teams={filteredTeams} />
            <AllMembers teams={teams} />
        </div>
    )
}
