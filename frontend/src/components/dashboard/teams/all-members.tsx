"use client";

import { Crown, Mail, Shield, User, UserPlus, Settings } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Team, User as UserType } from "@/type"
import { useRemoveMemberFromTeam, useUpdateTeamLeader } from "@/hooks/use-team"
import { useState } from "react"
import { toast } from "sonner"
import { useModalStore } from "@/hooks/use-modal-store"

interface AllMembersProps {
    teams: Team[];
    currentUserId?: number;
    canManageMembers?: boolean;
}

type MemberWithTeam = UserType & {
    teamId: number;
    teamName: string;
    isTeamLeader: boolean;
}

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

const getMemberType = (member: MemberWithTeam): "leader" | "coordinator" | "member" => {
    const role = member.role?.toLowerCase() || "";
    if (role.includes("lead")) return "leader";
    if (role.includes("coordinator")) return "coordinator";
    return "member";
};

const getMemberTypeBadge = (type: "leader" | "coordinator" | "member") => {
    switch (type) {
        case "leader":
            return "bg-purple-100 text-purple-800"
        case "coordinator":
            return "bg-blue-100 text-blue-800"
        default:
            return "bg-gray-100 text-gray-800"
    }
};

export const AllMembers = ({ teams, currentUserId, canManageMembers = false }: AllMembersProps) => {
    const [removingMemberId, setRemovingMemberId] = useState<number | null>(null);
    const removeMemberMutation = useRemoveMemberFromTeam();
    const updateLeaderMutation = useUpdateTeamLeader();
    const { openModal } = useModalStore();

    // Flatten members with team info
    const allMembers: MemberWithTeam[] = teams.flatMap(team =>
        (team.members || []).map(member => ({
            ...member,
            teamId: team.id,
            teamName: team.name,
            isTeamLeader: team.leaderId === member.id
        }))
    );

    // Remove duplicates (members in multiple teams)
    const uniqueMembers = allMembers.reduce((acc, member) => {
        const existing = acc.find(m => m.id === member.id);
        if (!existing) {
            acc.push(member);
        } else {
            // If member is in multiple teams, show the team where they're a leader
            if (member.isTeamLeader && !existing.isTeamLeader) {
                const index = acc.findIndex(m => m.id === member.id);
                acc[index] = member;
            }
        }
        return acc;
    }, [] as MemberWithTeam[]);

    const handleRemoveMember = async (member: MemberWithTeam) => {
        if (!canManageMembers) {
            toast.error("You don't have permission to remove members");
            return;
        }

        if (member.isTeamLeader) {
            toast.error("Cannot remove team leader. Assign a new leader first.");
            return;
        }

        setRemovingMemberId(member.id);
        try {
            await removeMemberMutation.mutateAsync({
                id: member.teamId,
                memberId: member.id
            });
            toast.success(`${member.firstName} ${member.lastName} removed from team`);
        } catch (error) {
            toast.error("Failed to remove member");
        } finally {
            setRemovingMemberId(null);
        }
    };

    const handlePromoteToLeader = async (member: MemberWithTeam) => {
        if (!canManageMembers) {
            toast.error("You don't have permission to change team leadership");
            return;
        }

        try {
            await updateLeaderMutation.mutateAsync({
                id: member.teamId,
                leaderId: member.id
            });
            toast.success(`${member.firstName} ${member.lastName} promoted to team leader`);
        } catch (error) {
            toast.error("Failed to promote member");
        }
    };

    const isCurrentUser = (member: MemberWithTeam) => currentUserId === member.id;

    return (
        <div className="mt-12">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>All Members</CardTitle>
                            <CardDescription className="mt-1">
                                Complete directory of club members ({uniqueMembers.length} total)
                            </CardDescription>
                        </div>
                        <div className="flex space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openModal("teamMembersManagement")}
                            >
                                <Settings className="h-4 w-4 mr-2" />
                                Manage All Members
                            </Button>
                            {canManageMembers && (
                                <Button variant="outline" size="sm">
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Invite Member
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {uniqueMembers.map((member) => {
                            const memberType = getMemberType(member);
                            const fullName = `${member.firstName} ${member.lastName}`.trim();
                            const RoleIcon = getRoleIcon(member.role || "");

                            return (
                                <div key={member.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                                    onClick={() => openModal("teamMembersManagement")}>
                                    <div className="flex items-start space-x-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={undefined} />
                                            <AvatarFallback>
                                                {toInitials(member.firstName, member.lastName)}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="font-medium text-gray-900 truncate">
                                                    {fullName || "Unnamed User"}
                                                </h3>
                                                {isCurrentUser(member) && (
                                                    <Badge variant="outline" className="text-xs">
                                                        You
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="space-y-1 mb-2">
                                                <div className="flex items-center space-x-2">
                                                    <Badge className={`text-xs ${getRoleColor(member.role || "")}`}>
                                                        <RoleIcon className="h-3 w-3 mr-1" />
                                                        {member.role || "Member"}
                                                    </Badge>
                                                    <Badge className={`text-xs ${getMemberTypeBadge(memberType)}`}>
                                                        {memberType === "leader" ? "Team Leader" :
                                                            memberType === "coordinator" ? "Coordinator" : "Member"}
                                                    </Badge>
                                                </div>
                                                <Badge variant="outline" className="text-xs">
                                                    {member.teamName}
                                                </Badge>
                                            </div>

                                            <div className="space-y-1 text-xs text-gray-600 mb-3">
                                                <div className="flex items-center space-x-1">
                                                    <Mail className="h-3 w-3" />
                                                    <span className="truncate">{member.email}</span>
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {member.college}
                                                </div>
                                            </div>

                                            {/* Simplified action - just show role */}
                                            <div className="text-xs text-gray-500">
                                                {member.isTeamLeader ? "Team Leader" : "Team Member"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {uniqueMembers.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>No members found in any teams</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}