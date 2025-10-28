'use client"';

import Link from "next/link";
import { useOrgId } from "@/hooks/use-org-id";
import { Button } from "@/components/ui/button";
import { useOrgMembers } from "@/hooks/use-org";
import { useCurrentUser } from "@/hooks/use-auth";
import { useOrgStore } from "@/hooks/use-org-store";
import { JoinUrlModal } from "./teams/join-url-modal";
import { useModalStore } from "@/hooks/use-modal-store";
import { Calendar, CheckSquare, DollarSign, Plus, UserPlus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const QuickActions = () => {
    const { activeOrg } = useOrgStore();
    const orgId = useOrgId();
    const { data: currentUser } = useCurrentUser();
    const { data: orgMembers } = useOrgMembers(Number(orgId));
    const openModal = useModalStore(state => state.openModal);

    const currentUserOrgMember = orgMembers?.find((member) => member.id === currentUser?.id);
    const userRole = currentUserOrgMember?.orgRole;
    const isLeader = userRole === "leader" || userRole === "coleader";

    const leaderActions = [
        {
            title: "Add Task",
            description: "Create new task",
            icon: CheckSquare,
            color: "bg-[#A3B18A]",
            href: `/orgs/${activeOrg?.id}/tasks`,
        },
        {
            title: "Budget Entry",
            description: "Record expense",
            icon: DollarSign,
            color: "bg-[#588157]",
            href: `/orgs/${activeOrg?.id}/budget`,
        },
    ];

    const memberActions = [
        {
            title: "View Task",
            description: "View assigned tasks",
            icon: CheckSquare,
            color: "bg-[#A3B18A]",
            href: `/orgs/${orgId}/tasks`,
        },
        {
            title: "View Budget",
            description: "View budget details",
            icon: DollarSign,
            color: "bg-[#588157]",
            href: `/orgs/${orgId}/budget`,
        },
    ];

    return (
        <>
            <Card className="bg-white/80 backdrop-blur-sm border-[#A3B18A]/20">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-[#344E41]">
                        <Plus className="h-5 w-5" />
                        <span className="text-lg font-semibold">Quick Actions</span>
                    </CardTitle>
                    <CardDescription className="text-[#3A5A40]">Common tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {isLeader ? (
                        <>
                            <div onClick={() => openModal("createEvent")} className="block hover:bg-[#DAD7CD]/30 transition-colors">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start h-auto p-3 border-[#A3B18A]/20 hover:bg-[#DAD7CD]/30 bg-transparent"
                                >
                                    <div className={`p-2 rounded-md mr-3 text-white bg-[#588157]`}>
                                        <Calendar className="h-4 w-4" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-[#344E41]">Create Event</p>
                                        <p className="text-xs text-[#3A5A40]">Plan a new event</p>
                                    </div>
                                </Button>
                            </div>
                            <div onClick={() => openModal("joinUrl")} className="block hover:bg-[#DAD7CD]/30 transition-colors">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start h-auto p-3 border-[#A3B18A]/20 hover:bg-[#DAD7CD]/30 bg-transparent"
                                >
                                    <div className={`p-2 rounded-md mr-3 text-white bg-[#588157]`}>
                                        <UserPlus className="h-4 w-4" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-[#344E41]">Invite Member</p>
                                        <p className="text-xs text-[#3A5A40]">Add member to club</p>
                                    </div>
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link
                                href={`/orgs/${orgId}/events`}
                                className="block hover:bg-[#DAD7CD]/30 transition-colors"
                            >
                                <Button
                                    variant="outline"
                                    className="w-full justify-start h-auto p-3 border-[#A3B18A]/20 hover:bg-[#DAD7CD]/30 bg-transparent"
                                >
                                    <div className={`p-2 rounded-md mr-3 text-white bg-[#588157]`}>
                                        <Calendar className="h-4 w-4" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-[#344E41]">View Events</p>
                                        <p className="text-xs text-[#3A5A40]">View all events</p>
                                    </div>
                                </Button>
                            </Link>
                        </>
                    )}
                    {isLeader ? leaderActions.map((action, index) => (
                        <Link
                            key={index}
                            href={action.href}
                            className="block hover:bg-[#DAD7CD]/30 transition-colors"
                        >
                            <Button
                                variant="outline"
                                className="w-full justify-start h-auto p-3 border-[#A3B18A]/20 hover:bg-[#DAD7CD]/30 bg-transparent"
                            >
                                <div className={`p-2 rounded-md mr-3 text-white ${action.color}`}>
                                    <action.icon className="h-4 w-4" />
                                </div>
                                <div className="text-left">
                                    <p className="font-medium text-[#344E41]">{action.title}</p>
                                    <p className="text-xs text-[#3A5A40]">{action.description}</p>
                                </div>
                            </Button>
                        </Link>
                    )) : memberActions.map((action, index) => (
                        <Link
                            key={index}
                            href={action.href}
                            className="block hover:bg-[#DAD7CD]/30 transition-colors"
                        >
                            <Button
                                variant="outline"
                                className="w-full justify-start h-auto p-3 border-[#A3B18A]/20 hover:bg-[#DAD7CD]/30 bg-transparent"
                            >
                                <div className={`p-2 rounded-md mr-3 text-white ${action.color}`}>
                                    <action.icon className="h-4 w-4" />
                                </div>
                                <div className="text-left">
                                    <p className="font-medium text-[#344E41]">{action.title}</p>
                                    <p className="text-xs text-[#3A5A40]">{action.description}</p>
                                </div>
                            </Button>
                        </Link>
                    ))}
                </CardContent>
            </Card>
            <JoinUrlModal />
        </>
    );
}
