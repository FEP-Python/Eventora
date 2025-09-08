"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, CheckSquare, DollarSign, Home, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";


export const Navigation = () => {
    const pathname = usePathname();

    const noOfEvents = 3;
    const noOfTasks = 23;

    const isActive = (path: string) => {
        return pathname === path;
    }

    const navigation = [
        {
            name: "Dashboard",
            href: "/orgs/1",
            icon: Home,
            isSelected: isActive("/orgs/1")
        },
        {
            name: "Events",
            href: "/orgs/1/events",
            icon: Calendar,
            badge: noOfEvents,
            isSelected: isActive("/orgs/1/events")
        },
        {
            name: "Teams",
            href: "/orgs/1/teams",
            icon: Users,
            isSelected: isActive("/orgs/1/teams")
        },
        {
            name: "Tasks",
            href: "/orgs/1/tasks",
            icon: CheckSquare,
            badge: noOfTasks,
            isSelected: isActive("/orgs/1/tasks")
        },
        {
            name: "Budget",
            href: "/orgs/1/budget",
            icon: DollarSign,
            isSelected: isActive("/orgs/1/budget")
        },
        // {
        //     name: "Analytics",
        //     href: "/dashboard/analytics",
        //     icon: BarChart3,
        //     isSelected: isActive("/dashboard/analytics")
        // },
        // {
        //     name: "Settings",
        //     href: "/dashboard/settings",
        //     icon: Settings,
        //     isSelected: isActive("/dashboard/settings")
        // },
    ];

    return (
        <nav className="flex-1 px-4 py-4">
            {navigation.map((item) => (
                <Link key={item.name} href={item.href} className="block mb-1">
                    <Button
                        variant={item.isSelected ? "secondary" : "ghost"}
                        className={cn(
                            "w-full justify-start",
                            item.isSelected ? "bg-[#588157]/10 text-[#3A5A40] hover:bg-[#588157]/20" : "text-[#3A5A40] hover:bg-[#DAD7CD]/30"
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
