import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, CheckSquare, DollarSign, FileText, Plus, UserPlus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const QuickActions = () => {
    const actions = [
        {
            title: "Create Event",
            description: "Plan a new event",
            icon: Calendar,
            color: "bg-[#588157]",
            href: "/dasboard/event/create",
        },
        {
            title: "Add Task",
            description: "Create new task",
            icon: CheckSquare,
            color: "bg-[#A3B18A]",
            href: "/dasboard/task/create",
        },
        {
            title: "Invite Member",
            description: "Add team member",
            icon: UserPlus,
            color: "bg-[#3A5A40]",
            href: "/dasboard/team/invite",
        },
        {
            title: "Budget Entry",
            description: "Record expense",
            icon: DollarSign,
            color: "bg-[#588157]",
            href: "/dasboard/budget/create",
        },
        {
            title: "Generate Report",
            description: "Create analytics",
            icon: FileText,
            color: "bg-[#A3B18A]",
            href: "/dasboard/budget/report",
        },
    ];

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
                {actions.map((action, index) => (
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
    );
}
