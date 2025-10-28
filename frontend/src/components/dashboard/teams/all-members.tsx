"use client";

import { OrgMember, OrgRole } from "@/type";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-auth";
import { useModalStore } from "@/hooks/use-modal-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, Mail, Shield, User, UserPlus, Settings, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AllMembersProps {
    members: OrgMember[];
    canManageMembers?: boolean;
}

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
        case "volunteer":
            return UserPlus
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
        case "volunteer":
            return "bg-green-100 text-green-800 border-green-200"
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
        case "volunteer":
            return "Volunteer"
        case "member":
            return "Member"
        default:
            return "Member"
    }
}

// Sort members by role hierarchy
const sortMembersByRole = (members: OrgMember[]): OrgMember[] => {
    const roleOrder: Record<OrgRole, number> = {
        leader: 1,
        coleader: 2,
        member: 3,
        volunteer: 4
    };

    return [...members].sort((a, b) => {
        const aOrder = roleOrder[a.orgRole] || 999;
        const bOrder = roleOrder[b.orgRole] || 999;

        if (aOrder !== bOrder) {
            return aOrder - bOrder;
        }

        // If same role, sort alphabetically by name
        const aName = `${a.firstName} ${a.lastName}`.toLowerCase();
        const bName = `${b.firstName} ${b.lastName}`.toLowerCase();
        return aName.localeCompare(bName);
    });
};

// Group members by role
const groupMembersByRole = (members: OrgMember[]) => {
    return members.reduce((acc, member) => {
        const role = member.orgRole || "member";
        if (!acc[role]) {
            acc[role] = [];
        }
        acc[role].push(member);
        return acc;
    }, {} as Record<OrgRole, OrgMember[]>);
};

export const AllMembers = ({ members, canManageMembers = false }: AllMembersProps) => {
    const { openModal } = useModalStore();
    const { data: currentUser } = useCurrentUser();

    const sortedMembers = sortMembersByRole(members);
    const groupedMembers = groupMembersByRole(members);

    const isCurrentUser = (member: OrgMember) => currentUser?.id === member.id;

    // Get role statistics
    const roleStats = {
        leaders: groupedMembers.leader?.length || 0,
        coleaders: groupedMembers.coleader?.length || 0,
        members: groupedMembers.member?.length || 0,
        volunteers: groupedMembers.volunteer?.length || 0,
    };

    return (
        <div className="mt-12">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Club Members
                            </CardTitle>
                            <CardDescription className="mt-1">
                                Complete directory of all club members ({sortedMembers.length} total)
                            </CardDescription>
                        </div>
                        {/* <div className="flex space-x-2">
                            {canManageMembers && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openModal("manageMembers")}
                                    >
                                        <Settings className="h-4 w-4 mr-2" />
                                        Manage Members
                                    </Button>
                                </>
                            )}
                        </div> */}
                    </div>

                    {/* Role Statistics */}
                    <div className="flex gap-2 mt-4 flex-wrap">
                        {roleStats.leaders > 0 && (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                <Crown className="h-3 w-3 mr-1" />
                                {roleStats.leaders} Leader{roleStats.leaders !== 1 ? 's' : ''}
                            </Badge>
                        )}
                        {roleStats.coleaders > 0 && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                <Shield className="h-3 w-3 mr-1" />
                                {roleStats.coleaders} Co-Leader{roleStats.coleaders !== 1 ? 's' : ''}
                            </Badge>
                        )}
                        {roleStats.members > 0 && (
                            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                                <User className="h-3 w-3 mr-1" />
                                {roleStats.members} Member{roleStats.members !== 1 ? 's' : ''}
                            </Badge>
                        )}
                        {roleStats.volunteers > 0 && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <UserPlus className="h-3 w-3 mr-1" />
                                {roleStats.volunteers} Volunteer{roleStats.volunteers !== 1 ? 's' : ''}
                            </Badge>
                        )}
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sortedMembers.map((member) => {
                            const fullName = `${member.firstName} ${member.lastName}`.trim();
                            const RoleIcon = getRoleIcon(member.orgRole);
                            const roleColor = getRoleColor(member.orgRole);
                            const roleLabel = getRoleLabel(member.orgRole);

                            return (
                                <div
                                    key={member.id}
                                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors hover:shadow-sm"
                                >
                                    <div className="flex items-start space-x-3">
                                        <Avatar className="h-12 w-12 ring-2 ring-gray-100">
                                            <AvatarImage src={undefined} />
                                            <AvatarFallback className="text-sm font-medium">
                                                {toInitials(member.firstName, member.lastName)}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1 min-w-0">
                                            {/* Name and "You" badge */}
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-semibold text-gray-900 truncate">
                                                    {fullName || "Unnamed User"}
                                                </h3>
                                                {isCurrentUser(member) && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        You
                                                    </Badge>
                                                )}
                                            </div>

                                            {/* Role Badge */}
                                            <div className="mb-3">
                                                <Badge className={`text-xs ${roleColor}`}>
                                                    <RoleIcon className="h-3 w-3 mr-1" />
                                                    {roleLabel}
                                                </Badge>
                                                {member.isOwner && (
                                                    <Badge variant="outline" className="text-xs ml-2 bg-purple-50 text-purple-700 border-purple-200">
                                                        <Crown className="h-3 w-3 mr-1" />
                                                        Owner
                                                    </Badge>
                                                )}
                                            </div>

                                            {/* Contact Info */}
                                            <div className="space-y-1.5 text-xs text-gray-600">
                                                <div className="flex items-center space-x-1.5">
                                                    <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                                                    <span className="truncate">{member.email}</span>
                                                </div>
                                                {member.college && (
                                                    <div className="text-xs text-gray-500 truncate">
                                                        {member.college}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Joined Date */}
                                            {member.joinedAt && (
                                                <div className="mt-2 text-xs text-gray-400">
                                                    Joined {new Date(member.joinedAt).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Empty State */}
                    {sortedMembers.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-medium mb-2">No members found</p>
                            <p className="text-sm">Start by inviting members to your organization</p>
                            {canManageMembers && (
                                <Button
                                    variant="outline"
                                    className="mt-4"
                                    onClick={() => openModal("inviteMember")}
                                >
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Invite First Member
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
