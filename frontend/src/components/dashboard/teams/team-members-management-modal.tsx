"use client";

import { User, OrgRole } from "@/type";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useOrgTeams } from "@/hooks/use-team";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-auth";
import { useOrgStore } from "@/hooks/use-org-store";
import { useModalStore } from "@/hooks/use-modal-store";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRemoveMemberFromTeam, useUpdateTeamMemberRole } from "@/hooks/use-team";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Users, Crown, UserMinus, Mail, Building2, Shield, User as UserIcon, UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const toInitials = (firstName?: string, lastName?: string) => {
    const f = (firstName || "").trim();
    const l = (lastName || "").trim();
    return `${f.charAt(0)}${l.charAt(0)}`.toUpperCase() || "U";
};

type TeamMembership = {
    teamId: number;
    teamName: string;
    teamRole: OrgRole;
    isTeamLeader: boolean;
};

type ConsolidatedMember = User & {
    teams: TeamMembership[];
};

const getRoleIcon = (role: OrgRole) => {
    switch (role) {
        case "leader":
            return Crown;
        case "coleader":
            return Shield;
        case "volunteer":
            return UserPlus;
        default:
            return UserIcon;
    }
};

const getRoleColor = (role: OrgRole) => {
    switch (role) {
        case "leader":
            return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "coleader":
            return "bg-blue-100 text-blue-800 border-blue-200";
        case "volunteer":
            return "bg-green-100 text-green-800 border-green-200";
        default:
            return "bg-gray-100 text-gray-800 border-gray-200";
    }
};

const getRoleLabel = (role: OrgRole) => {
    switch (role) {
        case "leader":
            return "Leader";
        case "coleader":
            return "Co-Leader";
        case "volunteer":
            return "Volunteer";
        case "member":
            return "Member";
        default:
            return "Member";
    }
};

export const TeamMembersManagementModal = ({ teamId, canManageMembers }: { teamId: number; canManageMembers: boolean }) => {
    const { activeOrg } = useOrgStore();
    const { data: currentUser } = useCurrentUser();
    const { isOpen, closeModal, type } = useModalStore();
    const { data: teams = [] } = useOrgTeams(activeOrg?.id || 0);
    const { mutate: removeMemberFromTeam, isPending: isRemoving } = useRemoveMemberFromTeam(teamId);
    const { mutate: updateMemberRole, isPending: isUpdatingRole } = useUpdateTeamMemberRole(teamId);

    const [searchTerm, setSearchTerm] = useState("");
    const [newRole, setNewRole] = useState<OrgRole>("member");
    const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<ConsolidatedMember | null>(null);
    const [selectedTeamMembership, setSelectedTeamMembership] = useState<TeamMembership | null>(null);
    const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>(teamId ? teamId.toString() : "all");

    const isModalOpen = isOpen && type === "teamMembersManagement";

    // Consolidate members
    const consolidatedMembers = useMemo(() => {
        const memberMap = new Map<number, ConsolidatedMember>();

        teams.forEach(team => {
            (team.members || []).forEach(member => {
                const existingMember = memberMap.get(member.id);
                const teamMembership: TeamMembership = {
                    teamId: team.id,
                    teamName: team.name,
                    teamRole: member.teamRole || "member",
                    isTeamLeader: team.leaderId === member.id
                };

                if (existingMember) {
                    existingMember.teams.push(teamMembership);
                } else {
                    memberMap.set(member.id, {
                        ...member,
                        teams: [teamMembership]
                    });
                }
            });
        });

        return Array.from(memberMap.values());
    }, [teams]);

    // Filter members
    const filteredMembers = useMemo(() => {
        let filtered = consolidatedMembers;

        if (selectedTeamFilter !== "all") {
            filtered = filtered.filter(member =>
                member.teams.some(t => t.teamId === parseInt(selectedTeamFilter))
            );
        }

        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(member =>
                `${member.firstName} ${member.lastName}`.toLowerCase().includes(search) ||
                member.email.toLowerCase().includes(search) ||
                member.college?.toLowerCase().includes(search)
            );
        }

        return filtered.sort((a, b) => {
            const aIsLeader = a.teams.some(t => t.isTeamLeader);
            const bIsLeader = b.teams.some(t => t.isTeamLeader);

            if (aIsLeader && !bIsLeader) return -1;
            if (!aIsLeader && bIsLeader) return 1;

            const aName = `${a.firstName} ${a.lastName}`.toLowerCase();
            const bName = `${b.firstName} ${b.lastName}`.toLowerCase();
            return aName.localeCompare(bName);
        });
    }, [consolidatedMembers, selectedTeamFilter, searchTerm]);

    const handleRemoveMember = (member: ConsolidatedMember, teamMembership: TeamMembership) => {
        if (teamMembership.isTeamLeader) {
            return;
        }

        removeMemberFromTeam({
            memberId: member.id
        });
    };

    const handleChangeRole = (member: ConsolidatedMember, teamMembership: TeamMembership) => {
        setSelectedMember(member);
        setSelectedTeamMembership(teamMembership);
        setNewRole(teamMembership.teamRole);
        setIsRoleDialogOpen(true);
    };

    const confirmRoleChange = () => {
        if (!selectedMember || !selectedTeamMembership) return;

        updateMemberRole({
            memberId: selectedMember.id,
            role: newRole
        }, {
            onSuccess: () => {
                setIsRoleDialogOpen(false);
                setSelectedMember(null);
                setSelectedTeamMembership(null);
            }
        });
    };

    const resetModal = () => {
        setSearchTerm("");
        setSelectedTeamFilter("all");
        closeModal();
    };

    if (!activeOrg) return null;

    return (
        <>
            <Dialog open={isModalOpen} onOpenChange={(open) => !open && resetModal()}>
                <DialogContent className="!w-full !max-w-6xl max-h-[95vh] p-0 border-none overflow-hidden">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle className="text-xl font-semibold text-gray-900">
                            Team Members Management
                        </DialogTitle>
                        <p className="text-sm text-gray-600 mt-1">
                            Manage all team members across your organization
                        </p>
                    </DialogHeader>

                    <div className="flex h-[calc(95vh-120px)]">
                        {/* Left Panel */}
                        <div className="w-80 border-r p-6 space-y-6 overflow-y-auto">
                            <div>
                                <Label>Search Members</Label>
                                <div className="relative mt-2">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search by name or email"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9"
                                        type="search"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 w-full">
                                <Label>Filter by Team</Label>
                                <Select value={selectedTeamFilter} onValueChange={setSelectedTeamFilter}>
                                    <SelectTrigger className="mt-1 w-full">
                                        <SelectValue placeholder="All Teams" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Teams</SelectItem>
                                        {teams.map((team) => (
                                            <SelectItem key={team.id} value={team.id.toString()}>
                                                {team.name} ({team.members?.length || 0})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="pt-4 border-t space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Total Members</span>
                                    <Badge variant="secondary">{consolidatedMembers.length}</Badge>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Filtered</span>
                                    <Badge variant="secondary">{filteredMembers.length}</Badge>
                                </div>
                            </div>
                        </div>

                        {/* Right Panel - Members List */}
                        <div className="flex-1 p-6 flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-medium text-gray-900">
                                    Members ({filteredMembers.length})
                                </h3>
                            </div>

                            <div className="flex-1 overflow-y-auto pb-4">
                                <div className="space-y-3">
                                    {filteredMembers.map((member) => (
                                        <Card key={member.id} className="hover:shadow-sm transition-shadow">
                                            <CardContent className="p-4">
                                                <div className="flex items-start space-x-4">
                                                    <Avatar className="h-12 w-12 ring-2 ring-gray-100">
                                                        <AvatarImage src={undefined} />
                                                        <AvatarFallback>
                                                            {toInitials(member.firstName, member.lastName)}
                                                        </AvatarFallback>
                                                    </Avatar>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="mb-2">
                                                            <h4 className="font-semibold text-gray-900">
                                                                {member.firstName} {member.lastName}
                                                            </h4>
                                                            <div className="flex items-center space-x-1 text-sm text-gray-600 mt-1">
                                                                <Mail className="h-3 w-3" />
                                                                <span className="truncate">{member.email}</span>
                                                            </div>
                                                            {member.college && (
                                                                <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                                                                    <Building2 className="h-3 w-3" />
                                                                    <span className="truncate">{member.college}</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="space-y-2">
                                                            <div className="text-xs font-medium text-gray-700">
                                                                Member of {member.teams.length} team{member.teams.length !== 1 ? 's' : ''}:
                                                            </div>
                                                        </div>

                                                        <div className="mt-3 space-y-2">
                                                            {member.teams.map((teamMembership) => {
                                                                const RoleIcon = getRoleIcon(teamMembership.teamRole);
                                                                const isCurrentUser = member.id === currentUser?.id;

                                                                return (
                                                                    <div
                                                                        key={teamMembership.teamId}
                                                                        className="flex items-center justify-between p-2 px-3 bg-gray-50 rounded-md"
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-xs font-medium text-gray-700">
                                                                                {teamMembership.teamName}
                                                                            </span>
                                                                            <Badge variant="outline" className={`text-xs ${getRoleColor(teamMembership.teamRole)}`}>
                                                                                <RoleIcon className="h-3 w-3 mr-1" />
                                                                                {getRoleLabel(teamMembership.teamRole)}
                                                                            </Badge>
                                                                        </div>

                                                                        <div className="flex items-center space-x-2">
                                                                            {canManageMembers && !isCurrentUser && (
                                                                                <>
                                                                                    <Button
                                                                                        variant="outline"
                                                                                        size="sm"
                                                                                        className="h-7 text-xs"
                                                                                        onClick={() => handleChangeRole(member, teamMembership)}
                                                                                    >
                                                                                        Change Role
                                                                                    </Button>

                                                                                    {!teamMembership.isTeamLeader && (
                                                                                        <AlertDialog>
                                                                                            <AlertDialogTrigger asChild>
                                                                                                <Button
                                                                                                    variant="outline"
                                                                                                    size="sm"
                                                                                                    className="h-7 text-xs text-red-600 hover:text-red-700"
                                                                                                >
                                                                                                    <UserMinus className="h-3 w-3 mr-1" />
                                                                                                    Remove
                                                                                                </Button>
                                                                                            </AlertDialogTrigger>
                                                                                            <AlertDialogContent>
                                                                                                <AlertDialogHeader>
                                                                                                    <AlertDialogTitle>Remove Member</AlertDialogTitle>
                                                                                                    <AlertDialogDescription>
                                                                                                        Are you sure you want to remove {member.firstName} {member.lastName} from {teamMembership.teamName}?
                                                                                                        This action cannot be undone.
                                                                                                    </AlertDialogDescription>
                                                                                                </AlertDialogHeader>
                                                                                                <AlertDialogFooter>
                                                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                                                    <AlertDialogAction
                                                                                                        onClick={() => handleRemoveMember(member, teamMembership)}
                                                                                                        disabled={isRemoving}
                                                                                                        className="bg-red-600 hover:bg-red-700"
                                                                                                    >
                                                                                                        {isRemoving ? "Removing..." : "Remove"}
                                                                                                    </AlertDialogAction>
                                                                                                </AlertDialogFooter>
                                                                                            </AlertDialogContent>
                                                                                        </AlertDialog>
                                                                                    )}
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}

                                    {filteredMembers.length === 0 && (
                                        <div className="text-center py-12">
                                            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                            <p className="text-gray-500">
                                                {searchTerm || selectedTeamFilter !== "all"
                                                    ? "No members found matching your criteria"
                                                    : "No members found in any teams"}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Role Change Dialog */}
            <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Change Member Role</DialogTitle>
                        <DialogDescription>
                            Update the role for {selectedMember?.firstName} {selectedMember?.lastName} in {selectedTeamMembership?.teamName}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Current Role</Label>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <Badge variant="outline" className={getRoleColor(selectedTeamMembership?.teamRole || "member")}>
                                    {getRoleLabel(selectedTeamMembership?.teamRole || "member")}
                                </Badge>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>New Role</Label>
                            <Select value={newRole} onValueChange={(value) => setNewRole(value as OrgRole)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="leader">
                                        <div className="flex items-center gap-2">
                                            <Crown className="h-4 w-4" />
                                            <span>Leader</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="coleader">
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-4 w-4" />
                                            <span>Co-Leader</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="member">
                                        <div className="flex items-center gap-2">
                                            <UserIcon className="h-4 w-4" />
                                            <span>Member</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="volunteer">
                                        <div className="flex items-center gap-2">
                                            <UserPlus className="h-4 w-4" />
                                            <span>Volunteer</span>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {newRole === "leader" && (
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-sm text-yellow-800">
                                    <strong>Note:</strong> Promoting this member to Leader will demote the current leader to Member.
                                </p>
                            </div>
                        )}

                        {newRole === "coleader" && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <strong>Note:</strong> A team can have only one co-leader. The current co-leader (if any) will need to be changed first.
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsRoleDialogOpen(false)}
                            disabled={isUpdatingRole}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmRoleChange}
                            disabled={isUpdatingRole || newRole === selectedTeamMembership?.teamRole}
                        >
                            {isUpdatingRole ? "Updating..." : "Update Role"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
