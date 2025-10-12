"use client";

import { Crown, PlusCircle, Settings, Shield, User, Users } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Team, Task } from "@/type"
import { useModalStore } from "@/hooks/use-modal-store";
import { CreateTeamModal } from "./create-team-modal";

interface TeamsGridProps {
    teams: Team[];
}

type TeamCategory = "core" | "support";

const toInitials = (firstName?: string, lastName?: string) => {
    const f = (firstName || "").trim();
    const l = (lastName || "").trim();
    return `${f.charAt(0)}${l.charAt(0)}`.toUpperCase() || "U";
};

const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
        case "team lead":
            return Crown
        case "coordinator":
            return Shield
        default:
            return User
    }
}

const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
        case "team lead":
            return "bg-yellow-100 text-yellow-800"
        case "coordinator":
            return "bg-blue-100 text-blue-800"
        default:
            return "bg-gray-100 text-gray-800"
    }
}

const getTeamStats = (tasks: Task[] | undefined) => {
    const list = tasks || [];
    const completed = list.filter(t => t.status === "completed").length;
    const activeEventIds = new Set<number>();
    for (const t of list) {
        if (t.status !== "completed" && t.eventId) activeEventIds.add(t.eventId);
    }
    return {
        activeEvents: activeEventIds.size,
        completedTasks: completed,
    };
};

const getTeamCategory = (team: Team): TeamCategory => {
    // Heuristic categorization; tweak as needed.
    const size = team.members?.length || 0;
    const tasks = team.tasks?.length || 0;
    if (size >= 5 || tasks >= 10) return "core";
    return "support";
};

const getCategoryBadgeClass = (category: TeamCategory) => {
    return category === "core"
        ? "bg-purple-100 text-purple-800"
        : "bg-emerald-100 text-emerald-800";
};

export const TeamsGrid = ({ teams }: TeamsGridProps) => {
    const { openModal } = useModalStore();

    if (!teams || teams.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                <div className="relative">
                    <div className="p-6 bg-[#3A5A40]/90 rounded-full shadow-inner">
                        <Users className="h-12 w-12 text-white" />
                    </div>
                </div>

                <div className="max-w-md space-y-2">
                    <h2 className="text-2xl font-semibold text-gray-900">
                        No Teams Created Yet
                    </h2>
                    <p className="text-gray-600 text-sm">
                        You haven’t created any teams in your organization yet. Teams help you
                        organize members, assign tasks, and track progress efficiently.
                    </p>
                </div>

                <Button
                    asChild
                    variant="green"
                    size="lg"
                    onClick={() => openModal("createTeam")}
                    className="flex items-center gap-2 rounded-lg shadow-md"
                >
                    <div onClick={() => openModal("createTeam")}>
                        <PlusCircle className="h-5 w-5" />
                        Create Your First Team
                    </div>
                </Button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {teams.map((team) => {
                const category = getTeamCategory(team);
                const { activeEvents, completedTasks } = getTeamStats(team.tasks);
                const members = team.members || [];

                return (
                    <Card key={team.id} className="hover:shadow-none">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <CardTitle className="text-lg">{team.name}</CardTitle>
                                        <Badge className={getCategoryBadgeClass(category)}>
                                            {members.length} members
                                        </Badge>
                                    </div>
                                    <CardDescription className="text-sm">{team.description}</CardDescription>
                                </div>
                                {/* Remove the Manage Members button from here */}
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {/* Team Stats */}
                            <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-gray-900">{activeEvents}</p>
                                    <p className="text-xs text-gray-600">Active Events</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-gray-900">{completedTasks}</p>
                                    <p className="text-xs text-gray-600">Completed Tasks</p>
                                </div>
                            </div>

                            {/* Team Members */}
                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Team Members</h4>
                                <div className="space-y-3">
                                    {members.slice(0, 4).map((member) => {
                                        const RoleIcon = getRoleIcon(member.role || "");
                                        const fullName = `${member.firstName} ${member.lastName}`.trim();
                                        return (
                                            <div
                                                key={member.id}
                                                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                <Avatar className="h-8 w-8">
                                                    {/* No avatar URL in type; keep fallback */}
                                                    <AvatarImage src={undefined} />
                                                    <AvatarFallback className="text-xs">
                                                        {toInitials(member.firstName, member.lastName)}
                                                    </AvatarFallback>
                                                </Avatar>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-2">
                                                        <p className="text-sm font-medium text-gray-900 truncate">{fullName || "Unnamed"}</p>
                                                    </div>
                                                    {member.role && (
                                                        <div className="flex items-center space-x-2">
                                                            <Badge className={`text-xs ${getRoleColor(member.role)}`}>
                                                                <RoleIcon className="h-3 w-3 mr-1" />
                                                                {member.role}
                                                            </Badge>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}

                                    {members.length > 4 && (
                                        <div className="text-center py-2">
                                            <Button variant="ghost" size="sm" className="text-xs">
                                                +{members.length - 4} more members
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-2 pt-2 border-t border-gray-200">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 bg-transparent"
                                    onClick={() => openModal("teamMembersManagement")}
                                >
                                    <Users className="h-4 w-4" />
                                    View Team
                                </Button>

                                {/* Support teams: show Assign Task if no active events */}
                                {category === "support" && activeEvents === 0 && (
                                    <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                                        <Link href={`/orgs/${team.orgId}/tasks/new?teamId=${team.id}`}>
                                            <Settings className="h-4 w-4" />
                                            Assign Task
                                        </Link>
                                    </Button>
                                )}

                                {/* Core teams: show Manage; Support teams with activity: show View Tasks */}
                                {category === "core" ? (
                                    <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                                        <Link href={`/orgs/${team.orgId}/teams/${team.id}/settings`}>
                                            <Settings className="h-4 w-4" />
                                            Manage
                                        </Link>
                                    </Button>
                                ) : (
                                    activeEvents > 0 && (
                                        <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                                            <Link href={`/orgs/${team.orgId}/tasks?teamId=${team.id}&status=active`}>
                                                <Settings className="h-4 w-4" />
                                                View Tasks
                                            </Link>
                                        </Button>
                                    )
                                )}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
            <CreateTeamModal />
        </div>
    )
}
