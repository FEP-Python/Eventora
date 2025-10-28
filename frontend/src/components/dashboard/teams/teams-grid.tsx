"use client";

import { Crown, PlusCircle, Shield, User, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Team, Task, OrgRole } from "@/type"
import { useModalStore } from "@/hooks/use-modal-store";
import { CreateTeamModal } from "./create-team-modal";
import { TeamMembersManagementModal } from "./team-members-management-modal";
import { useState } from "react";

interface TeamsGridProps {
    teams: Team[];
    canManageMembers: boolean;
}

type TeamCategory = "core" | "support";

const toInitials = (firstName?: string, lastName?: string) => {
    const f = (firstName || "").trim();
    const l = (lastName || "").trim();
    return `${f.charAt(0)}${l.charAt(0)}`.toUpperCase() || "U";
};

const getRoleIcon = (role: OrgRole) => {
    switch (role) {
        case "leader":
            return Crown
        case "coleader":
            return Shield
        default:
            return User
    }
}

const getRoleColor = (role: OrgRole) => {
    switch (role) {
        case "leader":
            return "bg-yellow-100 text-yellow-800 border-yellow-200"
        case "coleader":
            return "bg-blue-100 text-blue-800 border-blue-200"
        default:
            return "bg-gray-100 text-gray-800 border-gray-200"
    }
}

const getRoleLabel = (role: OrgRole) => {
    switch (role) {
        case "leader":
            return "Leader"
        case "coleader":
            return "Co-Leader"
        case "member":
            return "Member"
        case "volunteer":
            return "Volunteer"
        default:
            return "Member"
    }
}

const getTeamStats = (tasks: Task[] | undefined) => {
    const list = tasks || [];
    const completed = list.filter(t => t.status === "completed").length;
    const pending = list.filter(t => t.status === "pending").length;
    const inProgress = list.filter(t => t.status === "in_progress").length;

    return {
        totalTasks: list.length,
        completedTasks: completed,
        activeTasks: pending + inProgress,
    };
};

const getTeamCategory = (team: Team): TeamCategory => {
    const size = team.members?.length || 0;
    const tasks = team.tasks?.length || 0;

    // Teams with 5+ members or 10+ tasks are considered "core"
    if (size >= 5 || tasks >= 10) return "core";
    return "support";
};

const getCategoryBadgeClass = (category: TeamCategory) => {
    return category === "core"
        ? "bg-purple-100 text-purple-800 border-purple-200"
        : "bg-emerald-100 text-emerald-800 border-emerald-200";
};

export const TeamsGrid = ({ teams, canManageMembers }: TeamsGridProps) => {
    const { openModal } = useModalStore();
    const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

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
                        You haven&apos;t created any teams in your organization yet. Teams help you
                        organize members, assign tasks, and track progress efficiently.
                    </p>
                </div>

                <Button
                    variant="green"
                    size="lg"
                    onClick={() => openModal("createTeam")}
                    className="flex items-center gap-2 rounded-lg shadow-md"
                >
                    <PlusCircle className="h-5 w-5" />
                    Create Your First Team
                </Button>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {teams.map((team) => {
                    const category = getTeamCategory(team);
                    const { completedTasks, activeTasks } = getTeamStats(team.tasks);
                    const members = team.members || [];
                    const leader = members.find(m => m.id === team.leaderId);

                    return (
                        <Card key={team.id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <CardTitle className="text-lg">{team.name}</CardTitle>
                                            <Badge variant="outline" className={getCategoryBadgeClass(category)}>
                                                {category === "core" ? "Core Team" : "Support Team"}
                                            </Badge>
                                        </div>
                                        <CardDescription className="text-sm line-clamp-2">
                                            {team.description || "No description provided"}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {/* Team Leader Info */}
                                {leader && (
                                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                            <Crown className="h-4 w-4 text-yellow-600" />
                                            <span className="text-sm font-medium text-yellow-900">
                                                Led by {leader.firstName} {leader.lastName}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Team Stats */}
                                <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="text-center">
                                        <p className="text-xl font-bold text-gray-900">{members.length}</p>
                                        <p className="text-xs text-gray-600">Members</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xl font-bold text-blue-600">{activeTasks}</p>
                                        <p className="text-xs text-gray-600">Active</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xl font-bold text-green-600">{completedTasks}</p>
                                        <p className="text-xs text-gray-600">Done</p>
                                    </div>
                                </div>

                                {/* Team Members Preview */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-medium text-gray-900 text-sm">Team Members</h4>
                                        <Badge variant="secondary" className="text-xs">
                                            {members.length} total
                                        </Badge>
                                    </div>

                                    <div className="space-y-2">
                                        {members.slice(0, 3).map((member) => {
                                            const RoleIcon = getRoleIcon(member.teamRole || "member");
                                            const fullName = `${member.firstName} ${member.lastName}`.trim();
                                            const roleLabel = getRoleLabel(member.teamRole || "member");

                                            return (
                                                <div
                                                    key={member.id}
                                                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                                                >
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={undefined} />
                                                        <AvatarFallback className="text-xs">
                                                            {toInitials(member.firstName, member.lastName)}
                                                        </AvatarFallback>
                                                    </Avatar>

                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                            {fullName || "Unnamed"}
                                                        </p>
                                                        <Badge
                                                            variant="outline"
                                                            className={`text-xs mt-1 ${getRoleColor(member.teamRole || "member")}`}
                                                        >
                                                            <RoleIcon className="h-3 w-3 mr-1" />
                                                            {roleLabel}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            )
                                        })}

                                        {members.length > 3 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="w-full text-xs"
                                                onClick={() => {
                                                    setSelectedTeamId(team.id);
                                                    openModal("teamMembersManagement");
                                                }}
                                            >
                                                +{members.length - 3} more members
                                            </Button>
                                        )}

                                        {members.length === 0 && (
                                            <div className="text-center py-4 text-gray-400 text-xs">
                                                No members yet
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex space-x-2 pt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => {
                                            setSelectedTeamId(team.id);
                                            openModal("teamMembersManagement");
                                        }}
                                    >
                                        <Users className="h-4 w-4 mr-2" />
                                        View Team
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Modals */}
            <CreateTeamModal />
            {selectedTeamId && (
                <>
                    <TeamMembersManagementModal teamId={selectedTeamId} canManageMembers={canManageMembers} />
                </>
            )}
        </>
    )
}
