"use client";

import { ChevronsUpDown, LogOut } from "lucide-react";

import { useCurrentUser, useIsAuthenticated, useLogout } from "@/hooks/use-auth";
import { useUserContext } from "@/hooks/use-rbac";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { RoleBadge } from "@/components/rbac";
import { useOrgId } from "@/hooks/use-org-id";


export const SidebarUserProfile = () => {
    const logout = useLogout();
    const { data: user } = useCurrentUser();
    const { isAuthenticated } = useIsAuthenticated();
    const orgId = useOrgId();
    const userContext = useUserContext(Number(orgId));

    const { isMobile } = useSidebar();

    const handleLogout = () => {
        logout.mutate();
    };

    return (
        <SidebarMenu>
            {isAuthenticated && user && (
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            >
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarFallback className="rounded-lg">
                                        {user.firstName.charAt(0)}
                                        {user.lastName.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{user.firstName} {user.lastName}</span>
                                    <span className="truncate text-xs">{user.email}</span>
                                    {userContext?.organizationRole && (
                                        <div className="mt-1">
                                            <RoleBadge role={userContext.organizationRole} size="sm" />
                                        </div>
                                    )}
                                </div>
                                <ChevronsUpDown className="ml-auto size-4" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                            side={isMobile ? "bottom" : "right"}
                            align="end"
                            sideOffset={4}
                        >
                            <DropdownMenuLabel className="p-0 font-normal">
                                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarFallback className="rounded-lg">
                                            {user.firstName.charAt(0)}
                                            {user.lastName.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-medium">{user.firstName} {user.lastName}</span>
                                        <span className="truncate text-xs">{user.email}</span>
                                        {userContext?.organizationRole && (
                                            <div className="mt-1">
                                                <RoleBadge role={userContext.organizationRole} size="sm" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout}>
                                <LogOut />
                                Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            )}
        </SidebarMenu>
    );
}
