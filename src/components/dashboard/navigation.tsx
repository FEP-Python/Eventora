import Link from "next/link";
import { BarChart3, Calendar, CheckSquare, DollarSign, Home, Settings, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";


export const Navigation = () => {
    const noOfEvents = 3;
    const noOfTasks = 23;

    const navigation = [
        { name: "Dashboard", href: "/dashboard", icon: Home, isActive: true },
        { name: "Events", href: "/dashboard/events", icon: Calendar, badge: noOfEvents },
        { name: "Teams", href: "/dashboard/teams", icon: Users },
        { name: "Tasks", href: "/dashboard/tasks", icon: CheckSquare, badge: noOfTasks },
        { name: "Budget", href: "/dashboard/budget", icon: DollarSign },
        { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ];

    return (
        <nav className="flex-1 px-4 py-4">
            {navigation.map((item) => (
                <Link key={item.name} href={item.href} className="block mb-1">
                    <Button
                        variant={item.isActive ? "secondary" : "ghost"}
                        className={cn(
                            "w-full justify-start",
                            item.isActive ? "bg-[#588157]/10 text-[#3A5A40] hover:bg-[#588157]/20" : "text-[#3A5A40] hover:bg-[#DAD7CD]/30"
                        )}
                    >
                        <item.icon className="h-4 w-4 mr-3" />
                        {item.name}
                        {item.badge && (
                            <Badge variant="secondary" className="ml-auto bg-[#A3B18A]/20 text-[#3A5A40] rounded-full">
                                {item.badge}
                            </Badge>
                        )}
                    </Button>
                </Link>
            ))}
        </nav>
    );
}
