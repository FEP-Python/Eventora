"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation";
import { ChevronsUpDown, Plus, Link as LinkIcon } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

import { Org } from "@/type"
import { useOrgStore } from "@/hooks/use-org-store"
import { useIsMobile } from "@/hooks/use-mobile";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function OrgSwitcher({ orgs }: { orgs: Org[] }) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const { activeOrg, setActiveOrg } = useOrgStore();

  useEffect(() => {
    if (orgs.length > 0) {
      setActiveOrg(activeOrg ? activeOrg : orgs[0]);
    }
  }, [orgs, setActiveOrg, activeOrg]);

  const switchOrg = (org: Org) => {
    setActiveOrg(org);
    queryClient.invalidateQueries({ queryKey: ["orgs"] });
    queryClient.invalidateQueries({ queryKey: ["org", org.id] });
    router.push(`/orgs/${org.id}`);
  }

  const copyJoinUrl = () => {
    if (!activeOrg?.code) {
      toast.error("Organization code not found");
      return;
    }

    const joinUrl = `${window.location.origin}/join-club?code=${activeOrg.code}`;
    navigator.clipboard.writeText(joinUrl);
    toast.success("Join URL copied to clipboard!");
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground bg-[#588157]/10 cursor-pointer pl-4"
            >
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeOrg?.name}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            side={isMobile ? "bottom" : "right"}
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Your Clubs
            </DropdownMenuLabel>
            {orgs.map((org) => (
              <DropdownMenuItem
                key={org.name}
                onClick={() => switchOrg(org)}
                className="gap-2 p-2 cursor-pointer"
              >
                {org.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />

            {/* Copy Join URL Button */}
            {activeOrg && (
              <DropdownMenuItem
                className="gap-2 p-2 cursor-pointer"
                onClick={copyJoinUrl}
              >
                <LinkIcon className="size-4" />
                <div className="text-muted-foreground font-medium">
                  Copy Join URL
                </div>
              </DropdownMenuItem>
            )}

            <DropdownMenuItem className="gap-2 p-2 cursor-pointer" onClick={() => router.push('/create-org')}>
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">
                Create club
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
