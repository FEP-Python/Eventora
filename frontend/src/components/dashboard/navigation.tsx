"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, CheckSquare, DollarSign, Home, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useOrgStore } from "@/hooks/use-org-store";

interface NavigationProps {
    events: number;
    teams: number;
}


export const Navigation = ({ events, teams }: NavigationProps) => {
    const pathname = usePathname();
    const { activeOrg } = useOrgStore();

    const isActive = (path: string) => {
        return pathname === path;
    }

    const navigation = [
        {
            name: "Dashboard",
            href: `/orgs/${activeOrg?.id}`,
            icon: Home,
            isSelected: isActive(`/orgs/${activeOrg?.id}`)
        },
        {
            name: "Events",
            href: `/orgs/${activeOrg?.id}/events`,
            icon: Calendar,
            badge: !events ? null : events,
            isSelected: isActive(`/orgs/${activeOrg?.id}/events`)
        },
        {
            name: "Teams",
            href: `/orgs/${activeOrg?.id}/teams`,
            icon: Users,
            badge: !teams ? null : teams,
            isSelected: isActive(`/orgs/${activeOrg?.id}/teams`)
        },
        {
            name: "Tasks",
            href: `/orgs/${activeOrg?.id}/tasks`,
            icon: CheckSquare,
            isSelected: isActive(`/orgs/${activeOrg?.id}/tasks`)
        },
        {
            name: "Budget",
            href: `/orgs/${activeOrg?.id}/budget`,
            icon: DollarSign,
            isSelected: isActive(`/orgs/${activeOrg?.id}/budget`)
        },
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
                        {item.badge && item.badge !== 0 && (
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
