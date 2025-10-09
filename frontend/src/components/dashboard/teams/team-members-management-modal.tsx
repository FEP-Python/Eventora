"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Users, Crown, UserMinus, Mail } from "lucide-react";
import { useModalStore } from "@/hooks/use-modal-store";
import { useOrgStore } from "@/hooks/use-org-store";
import { useOrgTeams } from "@/hooks/use-team";
import { useRemoveMemberFromTeam, useUpdateTeamLeader } from "@/hooks/use-team";
import { User } from "@/type";

const toInitials = (firstName?: string, lastName?: string) => {
    const f = (firstName || "").trim();
    const l = (lastName || "").trim();
    return `${f.charAt(0)}${l.charAt(0)}`.toUpperCase() || "U";
};

type TeamMember = User & {
    teamId: number;
    teamName: string;
    isTeamLeader: boolean;
    orgId: number;
};

export const TeamMembersManagementModal = () => {
    const { isOpen, closeModal, type } = useModalStore();
    const { activeOrg } = useOrgStore();
    const { data: teams = [] } = useOrgTeams(activeOrg?.id || 0);
    const { mutate: removeMemberFromTeam, isPending: isRemoving } = useRemoveMemberFromTeam();
    const { mutate: updateTeamLeader, isPending: isUpdatingLeader } = useUpdateTeamLeader();

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTeam, setSelectedTeam] = useState<string>("all");

    const isModalOpen = isOpen && type === "teamMembersManagement";

    // Get all members from all teams
    const allMembers = useMemo(() => {
        return teams.flatMap(team =>
            (team.members || []).map(member => ({
                ...member,
                teamId: team.id,
                teamName: team.name,
                isTeamLeader: team.leaderId === member.id,
                orgId: team.orgId
            }))
        );
    }, [teams]);

    // Filter members based on search and team selection
    const filteredMembers = useMemo(() => {
        let filtered = allMembers;

        // Filter by team
        if (selectedTeam !== "all") {
            filtered = filtered.filter(member => member.teamId === parseInt(selectedTeam));
        }

        // Filter by search term
        if (searchTerm.trim()) {
            filtered = filtered.filter(member =>
                `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                member.college?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return filtered;
    }, [allMembers, selectedTeam, searchTerm]);

    const handleRemoveMember = (member: TeamMember) => {
        removeMemberFromTeam(
            { id: member.teamId, memberId: member.id },
            {
                onSuccess: () => {
                    // Don't show toast here - let the mutation hook handle it
                },
                onError: (error: unknown) => {
                    console.error('Remove member error:', error);
                    // Don't show toast here - let the mutation hook handle it
                }
            }
        );
    };

    const handlePromoteToLeader = (member: TeamMember) => {
        updateTeamLeader(
            { id: member.teamId, leaderId: member.id },
            {
                onSuccess: () => {
                    // Don't show toast here - let the mutation hook handle it
                },
                onError: (error: unknown) => {
                    console.error('Promote member error:', error);
                    // Don't show toast here - let the mutation hook handle it
                }
            }
        );
    };

    const getRoleBadge = (member: TeamMember) => {
        if (member.isTeamLeader) {
            return <Badge className="bg-yellow-100 text-yellow-800"><Crown className="h-3 w-3 mr-1" />Team Leader</Badge>;
        }
        return <Badge variant="outline">Member</Badge>;
    };

    const resetModal = () => {
        setSearchTerm("");
        setSelectedTeam("all");
        closeModal();
    };

    if (!activeOrg) return null;

    return (
        <Dialog open={isModalOpen} onOpenChange={(open) => !open && resetModal()}>
            <DialogContent className="w-full max-w-6xl sm:max-w-6xl md:max-w-6xl lg:max-w-6xl xl:max-w-6xl max-h-[95vh] p-0 border-none overflow-hidden">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="text-xl font-semibold text-gray-900">Team Members Management</DialogTitle>
                    <p className="text-sm text-gray-600 mt-1">
                        Manage all team members across your club
                    </p>
                </DialogHeader>

                <div className="flex h-[calc(95vh-120px)]">
                    {/* Left Panel - Filters and Search */}
                    <div className="w-80 border-r p-6 space-y-4 overflow-y-auto">
                        <div>
                            <Label>Search Members</Label>
                            <div className="relative mt-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search by name or email"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8"
                                    type="search"
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Filter by Team</Label>
                            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="All Teams" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Teams</SelectItem>
                                    {teams.map((team) => (
                                        <SelectItem key={team.id} value={team.id.toString()}>
                                            {team.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm">Statistics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Total Members:</span>
                                    <span className="font-medium">{allMembers.length}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Team Leaders:</span>
                                    <span className="font-medium">{allMembers.filter(m => m.isTeamLeader).length}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Regular Members:</span>
                                    <span className="font-medium">{allMembers.filter(m => !m.isTeamLeader).length}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Filtered Results:</span>
                                    <span className="font-medium">{filteredMembers.length}</span>
                                </div>
                            </CardContent>
                        </Card>
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
                                    <Card key={`${member.teamId}-${member.id}`} className="hover:shadow-sm transition-shadow">
                                        <CardContent className="p-4">
                                            <div className="flex items-center space-x-4">
                                                <Avatar className="h-12 w-12">
                                                    <AvatarImage src={undefined} />
                                                    <AvatarFallback>
                                                        {toInitials(member.firstName, member.lastName)}
                                                    </AvatarFallback>
                                                </Avatar>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">
                                                                {member.firstName} {member.lastName}
                                                            </h4>
                                                            <p className="text-sm text-gray-600">{member.email}</p>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            {getRoleBadge(member)}
                                                            <Badge variant="outline" className="text-xs">
                                                                {member.teamName}
                                                            </Badge>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                        <div className="flex items-center space-x-1">
                                                            <Mail className="h-3 w-3" />
                                                            <span>{member.college}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    {!member.isTeamLeader && (
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                >
                                                                    <Crown className="h-3 w-3 mr-1" />
                                                                    Promote
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Promote to Team Leader</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Are you sure you want to promote {member.firstName} {member.lastName} to team leader of {member.teamName}?
                                                                        This will make them the new leader of the team.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => handlePromoteToLeader(member)}
                                                                        disabled={isUpdatingLeader}
                                                                    >
                                                                        {isUpdatingLeader ? "Promoting..." : "Promote"}
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    )}

                                                    {!member.isTeamLeader && (
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="text-red-600 hover:text-red-700"
                                                                >
                                                                    <UserMinus className="h-3 w-3 mr-1" />
                                                                    Remove
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Remove Member</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Are you sure you want to remove {member.firstName} {member.lastName} from {member.teamName}?
                                                                        This action cannot be undone.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => handleRemoveMember(member)}
                                                                        disabled={isRemoving}
                                                                        className="bg-red-600 hover:bg-red-700"
                                                                    >
                                                                        {isRemoving ? "Removing..." : "Remove"}
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}

                                {filteredMembers.length === 0 && (
                                    <div className="text-center py-12">
                                        <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                        <p className="text-gray-500">
                                            {searchTerm || selectedTeam !== "all"
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
    );
};
