"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, UserPlus, Users, X, Check, Crown, Shield, User as UserIcon } from "lucide-react";
import { useModalStore } from "@/hooks/use-modal-store";
import { useOrgStore } from "@/hooks/use-org-store";
import { useOrgTeams } from "@/hooks/use-team";
import { useAddMemberToTeam } from "@/hooks/use-team";
import { useOrgMembers } from "@/hooks/use-org";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { OrgRole } from "@/type";

const toInitials = (firstName?: string, lastName?: string) => {
    const f = (firstName || "").trim();
    const l = (lastName || "").trim();
    return `${f.charAt(0)}${l.charAt(0)}`.toUpperCase() || "U";
};

const getRoleIcon = (role: OrgRole) => {
    switch (role) {
        case "leader":
            return Crown;
        case "coleader":
            return Shield;
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

export const ManageMembersModal = () => {
    const { isOpen, closeModal, type } = useModalStore();
    const { activeOrg } = useOrgStore();
    const queryClient = useQueryClient();
    const { data: teams = [], isLoading: teamsLoading } = useOrgTeams(activeOrg?.id || 0);
    const { data: members = [], isLoading: membersLoading } = useOrgMembers(activeOrg?.id || 0);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTeam, setSelectedTeam] = useState<string>("");
    const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
    const [isAdding, setIsAdding] = useState(false);

    const isModalOpen = isOpen && type === "manageMembers";

    // Get team-specific mutation hook
    const teamId = selectedTeam ? parseInt(selectedTeam) : 0;
    const { mutate: addMemberToTeam } = useAddMemberToTeam(teamId);

    // Filter members based on search term
    const filteredMembers = useMemo(() => {
        if (!searchTerm.trim()) return members;

        const search = searchTerm.toLowerCase();
        return members.filter(member =>
            `${member.firstName || ""} ${member.lastName || ""}`.toLowerCase().includes(search) ||
            (member.email || "").toLowerCase().includes(search) ||
            (member.college || "").toLowerCase().includes(search) ||
            (member.orgRole || "").toLowerCase().includes(search)
        );
    }, [members, searchTerm]);

    // Get members who are not already in the selected team
    const availableMembers = useMemo(() => {
        if (!selectedTeam) return filteredMembers;

        const teamId = parseInt(selectedTeam);
        const selectedTeamData = teams.find(team => team.id === teamId);
        const teamMemberIds = selectedTeamData?.members?.map(m => m.id) || [];

        return filteredMembers.filter(member => !teamMemberIds.includes(member.id));
    }, [filteredMembers, selectedTeam, teams]);

    // Sort members: leaders first, then by name
    const sortedAvailableMembers = useMemo(() => {
        return [...availableMembers].sort((a, b) => {
            // Sort by role hierarchy
            const roleOrder: Record<OrgRole, number> = {
                leader: 1,
                coleader: 2,
                member: 3,
                volunteer: 4
            };

            const aOrder = roleOrder[a.orgRole] || 999;
            const bOrder = roleOrder[b.orgRole] || 999;

            if (aOrder !== bOrder) {
                return aOrder - bOrder;
            }

            // Sort alphabetically if same role
            const aName = `${a.firstName} ${a.lastName}`.toLowerCase();
            const bName = `${b.firstName} ${b.lastName}`.toLowerCase();
            return aName.localeCompare(bName);
        });
    }, [availableMembers]);

    const handleMemberSelection = (memberId: number) => {
        setSelectedMembers(prev =>
            prev.includes(memberId)
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );
    };

    const handleSelectAll = () => {
        if (selectedMembers.length === sortedAvailableMembers.length) {
            setSelectedMembers([]);
        } else {
            setSelectedMembers(sortedAvailableMembers.map(member => member.id));
        }
    };

    const handleAddToTeam = async () => {
        if (!selectedTeam || selectedMembers.length === 0) {
            toast.error("Please select a team and members");
            return;
        }

        const teamName = teams.find(t => t.id === parseInt(selectedTeam))?.name || "team";

        setIsAdding(true);
        let successCount = 0;
        let errorCount = 0;

        // Process each member
        const promises = selectedMembers.map((memberId) => {
            return new Promise<void>((resolve) => {
                addMemberToTeam(
                    { memberId },
                    {
                        onSuccess: () => {
                            successCount++;
                            resolve();
                        },
                        onError: () => {
                            errorCount++;
                            resolve();
                        }
                    }
                );
            });
        });

        // Wait for all operations to complete
        await Promise.all(promises);

        // Show results
        if (successCount > 0) {
            toast.success(`Successfully added ${successCount} member${successCount > 1 ? 's' : ''} to ${teamName}!`);
        }
        if (errorCount > 0) {
            toast.error(`${errorCount} member${errorCount > 1 ? 's' : ''} could not be added (may already be in team)`);
        }

        // Refresh data
        queryClient.invalidateQueries({ queryKey: ["teams", "org", activeOrg?.id] });
        queryClient.invalidateQueries({ queryKey: ["team", parseInt(selectedTeam)] });
        queryClient.invalidateQueries({ queryKey: ["team-members", parseInt(selectedTeam)] });
        queryClient.invalidateQueries({ queryKey: ["org-details", activeOrg?.id] });

        // Reset and close
        setIsAdding(false);
        setSelectedMembers([]);
        setSelectedTeam("");
        closeModal();
    };

    const resetModal = () => {
        setSearchTerm("");
        setSelectedTeam("");
        setSelectedMembers([]);
        closeModal();
    };

    if (!activeOrg) return null;

    const selectedTeamData = teams.find(t => t.id === parseInt(selectedTeam));

    return (
        <Dialog open={isModalOpen} onOpenChange={(open) => !open && resetModal()}>
            <DialogContent className="!w-full !max-w-5xl max-h-[90vh] p-0">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="text-xl font-semibold">Manage Team Members</DialogTitle>
                    <DialogDescription>
                        Add organization members to teams
                    </DialogDescription>
                </DialogHeader>

                <div className="flex h-[calc(90vh-140px)]">
                    {/* Right Panel - Members List */}
                    <div className="flex-1 border-l overflow-hidden flex flex-col order-2">
                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-medium text-gray-900">Available Members</h3>
                                <Badge variant="secondary">
                                    {sortedAvailableMembers.length} available
                                </Badge>
                            </div>

                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search by name, email, role, or college..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            {/* Select All */}
                            {sortedAvailableMembers.length > 0 && selectedTeam && (
                                <div className="flex items-center space-x-2 py-2">
                                    <Checkbox
                                        id="select-all"
                                        checked={selectedMembers.length === sortedAvailableMembers.length && sortedAvailableMembers.length > 0}
                                        onCheckedChange={handleSelectAll}
                                    />
                                    <Label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                                        Select All ({sortedAvailableMembers.length} members)
                                    </Label>
                                </div>
                            )}
                        </div>

                        {/* Members List - Scrollable */}
                        <div className="flex-1 overflow-y-auto px-6 pb-6">
                            <div className="space-y-2">
                                {membersLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="text-sm text-gray-500">Loading members...</div>
                                    </div>
                                ) : !selectedTeam ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <Users className="h-12 w-12 text-gray-300 mb-3" />
                                        <p className="text-sm font-medium text-gray-900 mb-1">Select a Team First</p>
                                        <p className="text-xs text-gray-500">Choose a team from the right panel to see available members</p>
                                    </div>
                                ) : sortedAvailableMembers.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <Users className="h-12 w-12 text-gray-300 mb-3" />
                                        <p className="text-sm font-medium text-gray-900 mb-1">
                                            {searchTerm ? "No members found" : "All members already in team"}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {searchTerm ? "Try adjusting your search" : "Everyone is already part of this team"}
                                        </p>
                                    </div>
                                ) : (
                                    sortedAvailableMembers.map((member) => {
                                        const RoleIcon = getRoleIcon(member.orgRole);
                                        const roleColor = getRoleColor(member.orgRole);
                                        const isSelected = selectedMembers.includes(member.id);

                                        return (
                                            <Card
                                                key={member.id}
                                                className={`cursor-pointer transition-all duration-200 ${isSelected
                                                    ? 'bg-blue-50 border-blue-200 shadow-sm ring-1 ring-blue-200'
                                                    : 'hover:bg-gray-50 hover:shadow-sm'
                                                    }`}
                                                onClick={() => handleMemberSelection(member.id)}
                                            >
                                                <CardContent className="p-3">
                                                    <div className="flex items-center space-x-3">
                                                        <Checkbox
                                                            checked={isSelected}
                                                            onCheckedChange={() => handleMemberSelection(member.id)}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                        <Avatar className="h-10 w-10 ring-2 ring-gray-100">
                                                            <AvatarImage src={undefined} />
                                                            <AvatarFallback>
                                                                {toInitials(member.firstName, member.lastName)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <p className="font-medium text-gray-900 truncate">
                                                                    {member.firstName} {member.lastName}
                                                                </p>
                                                                {isSelected && (
                                                                    <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-gray-600 truncate mb-1">{member.email}</p>
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant="outline" className={`text-xs ${roleColor}`}>
                                                                    <RoleIcon className="h-3 w-3 mr-1" />
                                                                    {getRoleLabel(member.orgRole)}
                                                                </Badge>
                                                                {member.isOwner && (
                                                                    <Badge className="text-xs bg-purple-100 text-purple-800">
                                                                        Owner
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Left Panel - Team Selection & Actions */}
                    <div className="w-96 p-6 space-y-6 overflow-y-auto order-1">
                        <div>
                            <h3 className="font-medium text-gray-900 mb-4">Select Team</h3>

                            <div className="space-y-2">
                                <Label>Team</Label>
                                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a team" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {teamsLoading ? (
                                            <SelectItem value="loading" disabled>
                                                Loading teams...
                                            </SelectItem>
                                        ) : teams.length === 0 ? (
                                            <SelectItem value="no-teams" disabled>
                                                No teams available
                                            </SelectItem>
                                        ) : (
                                            teams.map((team) => (
                                                <SelectItem key={team.id} value={team.id.toString()}>
                                                    <div className="flex items-center justify-between w-full">
                                                        <span className="font-medium">{team.name}</span>
                                                        <Badge variant="outline" className="ml-2">
                                                            {team.members?.length || 0} members
                                                        </Badge>
                                                    </div>
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Selected Team Info */}
                            {selectedTeamData && (
                                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-600 mb-1">Team Description</p>
                                    <p className="text-sm text-gray-900">
                                        {selectedTeamData.description || "No description provided"}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Selected Members Summary */}
                        {selectedMembers.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium flex items-center justify-between">
                                        <span>Selected Members</span>
                                        <Badge variant="secondary">{selectedMembers.length}</Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 max-h-48 overflow-y-auto p-0">
                                        {selectedMembers.map(memberId => {
                                            const member = members.find(m => m.id === memberId);
                                            if (!member) return null;

                                            return (
                                                <div key={memberId} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors">
                                                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarFallback className="text-xs">
                                                                {toInitials(member.firstName, member.lastName)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-sm font-medium truncate">
                                                            {member.firstName} {member.lastName}
                                                        </span>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleMemberSelection(memberId);
                                                        }}
                                                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Separator />

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <Button
                                onClick={handleAddToTeam}
                                disabled={!selectedTeam || selectedMembers.length === 0 || isAdding}
                                className="w-full"
                                size="lg"
                            >
                                {isAdding ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                        Adding Members...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Add {selectedMembers.length} Member{selectedMembers.length !== 1 ? 's' : ''} to Team
                                    </>
                                )}
                            </Button>

                            <Button variant="outline" onClick={resetModal} className="w-full" disabled={isAdding}>
                                Cancel
                            </Button>
                        </div>

                        {/* Help Text */}
                        <div className="text-xs text-gray-500 space-y-1">
                            <p>💡 <strong>Tip:</strong> Select a team first to see available members</p>
                            <p>✅ Members are filtered to show only those not already in the selected team</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
