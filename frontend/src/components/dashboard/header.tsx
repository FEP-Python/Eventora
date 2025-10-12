"use client";

import { toast } from "sonner";
import { useLogout } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link, LogOut, Plus } from "lucide-react";
import { useOrgStore } from "@/hooks/use-org-store";
import { useModalStore } from "@/hooks/use-modal-store";
import { CreateEventModal } from "./events/create-event-modal";

export const Header = () => {
    const logout = useLogout();
    const { activeOrg } = useOrgStore();
    const openModal = useModalStore(state => state.openModal);

    const copyJoinUrl = () => {
        if (!activeOrg?.code) {
            toast.error("Organization code not found");
            return;
        }

        const joinUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/join-club?code=${activeOrg.code}`;
        navigator.clipboard.writeText(joinUrl);
        toast.success("Join URL copied to clipboard!");
    };

    const handleLogout = () => {
        logout.mutate();
    };

    return (
        <>
            <header className="bg-white/90 backdrop-blur-sm border-b border-[#A3B18A]/20 px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Quick Actions */}
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" onClick={copyJoinUrl}>
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

                    <Button variant="destructive" onClick={handleLogout}>
                        <LogOut className="h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </header>
            <CreateEventModal />
        </>
    );
}
