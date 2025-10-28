"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Settings2Icon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { TeamsGrid } from "./teams-grid";
import { AllMembers } from "./all-members";
import { useOrgTeams } from "@/hooks/use-team";
import { useParams } from "next/navigation";
import { useModalStore } from "@/hooks/use-modal-store";
import { CreateTeamModal } from "./create-team-modal";
import { useOrgMembers } from "@/hooks/use-org";
import { useCurrentUser } from "@/hooks/use-auth";
import { ManageMembersModal } from "./manage-members-modal";

export const Teams = () => {
    const { orgId } = useParams<{ orgId: string }>();
    const [searchTerm, setSearchTerm] = useState("");
    const { data: currentUser } = useCurrentUser();
    const { openModal } = useModalStore();
    const { data: orgMembers } = useOrgMembers(Number(orgId));
    const { data: teams, isLoading: isTeamsLoading, refetch } = useOrgTeams(Number(orgId));

    console.log("Org Members: ", orgMembers);

    const currentUserMember = orgMembers?.find((member) => member.id === currentUser?.id);

    const currentUserRole = currentUserMember?.orgRole;
    const canManage = currentUserRole === "leader" || currentUserRole === "coleader";

    // Refetch teams data when modal closes (in case members were added)
    useEffect(() => {
        refetch();
    }, [orgId, refetch]);

    if (isTeamsLoading) {
        return <div>Loading...</div>;
    }

    if (!teams) {
        return <div>No teams found!</div>;
    }

    const filteredTeams = teams.filter(
        (team) =>
            (team.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (team.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            team.members.some((member) => (member.firstName || '').toLowerCase().includes(searchTerm.toLowerCase())),
    );

    return (
        <>
            <div>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Teams</h1>
                        <p className="text-gray-600">Manage your club&apos;s teams and members</p>
                    </div>
                    {(currentUserRole === 'leader' || currentUserRole === 'coleader') && (
                        <div className="flex items-center space-x-3">
                            <Button
                                variant="green"
                                className="flex items-center"
                                onClick={() => openModal("createTeam")}
                            >
                                <Plus className="h-4 w-4" />
                                <span>Create Team</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                    openModal("manageMembers");
                                }}
                            >
                                <Settings2Icon className="h-4 w-4 mr-2" />
                                Manage members
                            </Button>
                        </div>
                    )}
                </div>

                <div className="flex items-center space-x-4 mb-6">
                    <div className="flex-1 max-w-md relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search teams and members..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-[#f9fafb] focus:bg-white focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <TeamsGrid teams={filteredTeams} canManageMembers={canManage} />
                <AllMembers members={orgMembers || []} canManageMembers={canManage} />
            </div>
            <CreateTeamModal />
            <ManageMembersModal />
        </>
    )
}
