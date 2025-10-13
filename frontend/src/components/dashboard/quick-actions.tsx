import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, CheckSquare, DollarSign, FileText, Plus, UserPlus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useModalStore } from "@/hooks/use-modal-store";
import { useOrgStore } from "@/hooks/use-org-store";
import { toast } from "sonner";
import { ConditionalRender } from "@/components/rbac";
import { useEventPermissions, useTaskPermissions, useBudgetPermissions, useOrgPermissions } from "@/hooks/use-rbac";

export const QuickActions = () => {
    const { activeOrg } = useOrgStore();
    const openModal = useModalStore(state => state.openModal);
    
    // Get permissions
    const eventPermissions = useEventPermissions(activeOrg?.id);
    const taskPermissions = useTaskPermissions(activeOrg?.id);
    const budgetPermissions = useBudgetPermissions(activeOrg?.id);
    const orgPermissions = useOrgPermissions(activeOrg?.id);
    
    const actions = [
        {
            title: "Add Task",
            description: "Create new task",
            icon: CheckSquare,
            color: "bg-[#A3B18A]",
            href: `/orgs/${activeOrg?.id}/tasks`,
            permission: 'task:create' as const,
        },
        {
            title: "Budget Entry",
            description: "Record expense",
            icon: DollarSign,
            color: "bg-[#588157]",
            href: `/orgs/${activeOrg?.id}/budget`,
            permission: 'budget:create' as const,
        },
    ];

    const copyJoinUrl = () => {
        if (!activeOrg?.code) {
            toast.error("Club code not found");
            return;
        }

        const joinUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/join-club?code=${activeOrg.code}`;
        navigator.clipboard.writeText(joinUrl);
        toast.success("Join URL copied to clipboard!");
    };

    return (
        <Card className="bg-white/80 backdrop-blur-sm border-[#A3B18A]/20">
            <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-[#344E41]">
                    <Plus className="h-5 w-5" />
                    <span className="text-lg font-semibold">Quick Actions</span>
                </CardTitle>
                <CardDescription className="text-[#3A5A40]">Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <ConditionalRender permission="event:create" orgId={activeOrg?.id}>
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
                </ConditionalRender>
                
                <ConditionalRender permission="user:invite" orgId={activeOrg?.id}>
                    <div onClick={copyJoinUrl} className="block hover:bg-[#DAD7CD]/30 transition-colors">
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
                </ConditionalRender>
                
                {actions.map((action, index) => (
                    <ConditionalRender
                        key={index}
                        permission={action.permission}
                        orgId={activeOrg?.id}
                    >
                        <Link
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
                    </ConditionalRender>
                ))}
            </CardContent>
        </Card>
    );
}
