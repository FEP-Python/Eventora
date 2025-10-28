"use client";

import { toast } from "sonner";
import { useCurrentUser, useLogout } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link, LogOut, Plus } from "lucide-react";
import { useOrgStore } from "@/hooks/use-org-store";
import { useModalStore } from "@/hooks/use-modal-store";
import { CreateEventModal } from "./events/create-event-modal";
import { useOrgMembers } from "@/hooks/use-org";
import { useOrgId } from "@/hooks/use-org-id";
import { JoinUrlModal } from "./teams/join-url-modal";

export const Header = () => {
    const orgId = useOrgId();
    const logout = useLogout();
    const { data: currentUser } = useCurrentUser();
    const { data: orgMembers } = useOrgMembers(Number(orgId));
    const { activeOrg } = useOrgStore();
    const openModal = useModalStore(state => state.openModal);

    const currentUserMember = orgMembers?.find((member) => member.id === currentUser?.id);
    const currentUserRole = currentUserMember?.orgRole;
    console.log("Current User Role: ", currentUserRole);

    const copyJoinUrl = () => {
        if (!activeOrg?.code) {
            toast.error("Club code not found");
            return;
        }

        openModal("joinUrl");
    };

    const handleLogout = () => {
        logout.mutate();
    };

    return (
        <>
            <header className="bg-white/90 backdrop-blur-sm border-b border-[#A3B18A]/20 px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Quick Actions */}
                    {(currentUserRole === 'leader' || currentUserRole === 'coleader') && (
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="outline"
                                onClick={copyJoinUrl}
                            >
                                <Link className="h-4 w-4" />
                                Invite Member
                            </Button>
                            <Button
                                className="hidden md:flex bg-[#3A5A40] hover:bg-[#344E41] text-white"
                                onClick={() => openModal("createEvent")}
                            >
                                <Plus className="h-4 w-4" />
                                New Event
                            </Button>
                        </div>
                    )}

                    <Button variant="destructive" onClick={handleLogout} className="ml-auto">
                        <LogOut className="h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </header>
            <CreateEventModal />
            <JoinUrlModal />
        </>
    );
}
