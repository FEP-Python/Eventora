'use client';

import { CalendarDays } from "lucide-react";

import { Navigation } from "./navigation";
import { SidebarUserProfile } from "./sidebar-profile";
import { OrgSwitcher } from "./organization/org-switcher";

import { useUserAllOrgs } from "@/hooks/use-users-org";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";


export const DashboardSidebar = () => {
    const { data: orgs = [] } = useUserAllOrgs();

    return (
        <Sidebar className="flex flex-col w-64 bg-white/90 backdrop-blur-sm border-r border-[#A3B18A]/20">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="flex items-center justify-center h-16 px-4 border-b border-[#A3B18A]/20 gap-x-2">
                            <CalendarDays className="h-9 w-9 text-[#3A5A40]" />
                            <span className="text-2xl font-bold text-[#344E41]">Eventora</span>
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
                <OrgSwitcher orgs={orgs} />
            </SidebarHeader>
            <SidebarContent>
                <Navigation />
            </SidebarContent>
            <SidebarFooter>
                <SidebarUserProfile />
            </SidebarFooter>
        </Sidebar>
    );
};
