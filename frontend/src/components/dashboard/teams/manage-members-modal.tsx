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
import { Search, UserPlus, Users, X, Check } from "lucide-react";
import { useModalStore } from "@/hooks/use-modal-store";
import { useOrgStore } from "@/hooks/use-org-store";
import { useOrgTeams } from "@/hooks/use-team";
import { useAddMemberToTeam } from "@/hooks/use-team";
import { useOrgMembers } from "@/hooks/use-org";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const toInitials = (firstName?: string, lastName?: string) => {
    const f = (firstName || "").trim();
    const l = (lastName || "").trim();
    return `${f.charAt(0)}${l.charAt(0)}`.toUpperCase() || "U";
};

export const ManageMembersModal = () => {
    const { isOpen, closeModal, type } = useModalStore();
    const { activeOrg } = useOrgStore();
    const queryClient = useQueryClient();
    const { data: teams = [], isLoading: teamsLoading, refetch: refetchTeams } = useOrgTeams(activeOrg?.id || 0);
    const { data: members = [], isLoading: membersLoading } = useOrgMembers(activeOrg?.id || 0);
    const { mutate: addMemberToTeam, isPending: isAdding } = useAddMemberToTeam();

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTeam, setSelectedTeam] = useState<string>("");
    const [selectedMembers, setSelectedMembers] = useState<number[]>([]);

    const isModalOpen = isOpen && type === "manageMembers";

    // Filter members based on search term - with null safety
    const filteredMembers = useMemo(() => {
        if (!searchTerm.trim()) return members;

        return members.filter(member =>
            `${member.firstName || ''} ${member.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (member.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (member.college || '').toLowerCase().includes(searchTerm.toLowerCase())
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

    const handleMemberSelection = (memberId: number) => {
        setSelectedMembers(prev =>
            prev.includes(memberId)
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );
    };

    const handleSelectAll = () => {
        if (selectedMembers.length === availableMembers.length) {
            setSelectedMembers([]);
        } else {
            setSelectedMembers(availableMembers.map(member => member.id));
        }
    };

    const handleAddToTeam = () => {
        if (!selectedTeam || selectedMembers.length === 0) {
            toast.error("Please select a team and members");
            return;
        }

        const teamName = teams.find(t => t.id === parseInt(selectedTeam))?.name || "team";
        const memberNames = selectedMembers.map(id => {
            const member = members.find(m => m.id === id);
            return `${member?.firstName} ${member?.lastName}`;
        }).join(", ");

        let successCount = 0;
        let errorCount = 0;
        const totalMembers = selectedMembers.length;

        // Add each selected member to the team
        selectedMembers.forEach((memberId, index) => {
            addMemberToTeam(
                { id: parseInt(selectedTeam), memberId },
                {
                    onSuccess: () => {
                        successCount++;
                        if (successCount + errorCount === totalMembers) {
                            // All operations completed
                            if (successCount > 0) {
                                toast.success(`Successfully added ${successCount} member${successCount > 1 ? 's' : ''} to ${teamName}!`);
                            }
                            if (errorCount > 0) {
                                toast.error(`${errorCount} member${errorCount > 1 ? 's' : ''} could not be added (may already be in team)`);
                            }

                            // Force refresh of all team-related data
                            queryClient.invalidateQueries({ queryKey: ["teams", "org", activeOrg?.id] });
                            queryClient.invalidateQueries({ queryKey: ["teams", "org"] });
                            queryClient.invalidateQueries({ queryKey: ["team"] });

                            setSelectedMembers([]);
                            setSelectedTeam("");
                            closeModal();
                        }
                    },
                    onError: (error: any) => {
                        errorCount++;
                        if (successCount + errorCount === totalMembers) {
                            // All operations completed
                            if (successCount > 0) {
                                toast.success(`Successfully added ${successCount} member${successCount > 1 ? 's' : ''} to ${teamName}!`);
                            }
                            if (errorCount > 0) {
                                toast.error(`${errorCount} member${errorCount > 1 ? 's' : ''} could not be added (may already be in team)`);
                            }

                            // Force refresh of all team-related data
                            queryClient.invalidateQueries({ queryKey: ["teams", "org", activeOrg?.id] });
                            queryClient.invalidateQueries({ queryKey: ["teams", "org"] });
                            queryClient.invalidateQueries({ queryKey: ["team"] });

                            setSelectedMembers([]);
                            setSelectedTeam("");
                            closeModal();
                        }
                    }
                }
            );
        });
    };

    const resetModal = () => {
        setSearchTerm("");
        setSelectedTeam("");
        setSelectedMembers([]);
        closeModal();
    };

    if (!activeOrg) return null;

    return (
        <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 ${isModalOpen ? 'block' : 'hidden'}`}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Manage Team Members</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Add club members to teams
                        </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={resetModal}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex h-[calc(90vh-120px)]">
                    {/* Left Panel - Members */}
                    <div className="flex-1 border-r">
                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-medium text-gray-900">Available Members</h3>
                                <Badge variant="secondary">
                                    {availableMembers.length} members
                                </Badge>
                            </div>

                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search members by name, email, or college..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            {/* Select All */}
                            {availableMembers.length > 0 && (
                                <div className="flex items-center space-x-2 py-2">
                                    <Checkbox
                                        id="select-all"
                                        checked={selectedMembers.length === availableMembers.length && availableMembers.length > 0}
                                        onCheckedChange={handleSelectAll}
                                    />
                                    <Label htmlFor="select-all" className="text-sm font-medium">
                                        Select All ({availableMembers.length})
                                    </Label>
                                </div>
                            )}

                            {/* Members List */}
                            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                {membersLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="text-sm text-gray-500">Loading members...</div>
                                    </div>
                                ) : availableMembers.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <Users className="h-8 w-8 text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-500">
                                            {searchTerm ? "No members found matching your search" : "No available members"}
                                        </p>
                                    </div>
                                ) : (
                                    availableMembers.map((member) => (
                                        <Card
                                            key={member.id}
                                            className={`cursor-pointer transition-all duration-200 hover:shadow-sm ${selectedMembers.includes(member.id)
                                                ? 'bg-blue-50 border-blue-200 shadow-sm'
                                                : 'hover:bg-gray-50'
                                                }`}
                                            onClick={() => handleMemberSelection(member.id)}
                                        >
                                            <CardContent className="p-4">
                                                <div className="flex items-center space-x-3">
                                                    <Checkbox
                                                        checked={selectedMembers.includes(member.id)}
                                                        onChange={() => { }} // Handled by card click
                                                    />
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage src={undefined} />
                                                        <AvatarFallback className="bg-gray-100">
                                                            {toInitials(member.firstName, member.lastName)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center space-x-2">
                                                            <p className="font-medium text-gray-900 truncate">
                                                                {member.firstName} {member.lastName}
                                                            </p>
                                                            {selectedMembers.includes(member.id) && (
                                                                <Check className="h-4 w-4 text-blue-600" />
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-600 truncate">{member.email}</p>
                                                        <p className="text-xs text-gray-500">{member.college}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Team Selection & Actions */}
                    <div className="w-80 p-6 space-y-6">
                        <div>
                            <h3 className="font-medium text-gray-900 mb-4">Add to Team</h3>

                            <div className="space-y-2">
                                <Label>Select Team</Label>
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
                                                        <span>{team.name}</span>
                                                        <Badge variant="outline" className="ml-2">
                                                            {team.members?.length || 0}
                                                        </Badge>
                                                    </div>
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Selected Members Summary */}
                        {selectedMembers.length > 0 && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium">
                                        Selected Members ({selectedMembers.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {selectedMembers.map(memberId => {
                                            const member = members.find(m => m.id === memberId);
                                            return member ? (
                                                <div key={memberId} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center space-x-2">
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarFallback className="text-xs">
                                                                {toInitials(member.firstName, member.lastName)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-sm font-medium">
                                                            {member.firstName} {member.lastName}
                                                        </span>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleMemberSelection(memberId)}
                                                        className="h-6 w-6 p-0"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ) : null;
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
                            >
                                {isAdding ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Add {selectedMembers.length} Member{selectedMembers.length !== 1 ? 's' : ''} to Team
                                    </>
                                )}
                            </Button>

                            <Button variant="outline" onClick={resetModal} className="w-full">
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};