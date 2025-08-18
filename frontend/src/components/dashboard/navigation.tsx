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
            href: "/dashboard",
            icon: Home,
            isSelected: isActive("/dashboard")
        },
        {
            name: "Events",
            href: "/dashboard/events",
            icon: Calendar,
            badge: noOfEvents,
            isSelected: isActive("/dashboard/events")
        },
        {
            name: "Teams",
            href: "/dashboard/teams",
            icon: Users,
            isSelected: isActive("/dashboard/teams")
        },
        {
            name: "Tasks",
            href: "/dashboard/tasks",
            icon: CheckSquare,
            badge: noOfTasks,
            isSelected: isActive("/dashboard/tasks")
        },
        {
            name: "Budget",
            href: "/dashboard/budget",
            icon: DollarSign,
            isSelected: isActive("/dashboard/budget")
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
