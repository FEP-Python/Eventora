'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { StatsGrid } from "./stats";
import { QuickActions } from "./quick-actions";
import { TaskOverview } from "./task-overview";
import { UpcomingEvents } from "./upcoming-events";
import { BudgetOverview } from "./budget-overview";

import { useOrgStore } from "@/hooks/use-org-store";
import { useIsAuthenticated } from "@/hooks/use-auth";
import { useRequireOrganization } from "@/utils/org-client-guard";

export const Dashboard = () => {
    const router = useRouter();

    const { activeOrg } = useOrgStore();
    // const { data: ownedOrgs } = useGetAllOwnedOrg();

    const { isAuthenticated } = useIsAuthenticated();
    const { hasOrganizations, isLoading: orgLoading } = useRequireOrganization();

    useEffect(() => {
      // First check auth, then organizations
      if (!isAuthenticated) {
        router.push('/login');
      }
    }, [isAuthenticated, router]);

    // Don't render if not authenticated
    if (!isAuthenticated) {
      return <div>Redirecting to login...</div>;
    }

    // Show loading while checking organizations
    if (orgLoading) {
      return <div>Checking your organizations...</div>;
    }

    // Organization check will handle redirect if no orgs
    if (!hasOrganizations) {
      return <div>Redirecting to organization creation...</div>;
    }

    // if (!ownedOrgs) return <p>Loading organizations...</p>;

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#344E41] mb-2">Welcome back {activeOrg?.name} to Eventora</h1>
                <p className="text-[#3A5A40]">Here&apos;s what&apos;s happening with your organization today.</p>
            </div>

            <StatsGrid />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-1">
                    <QuickActions />
                </div>
                <div className="lg:col-span-2">
                    <UpcomingEvents />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TaskOverview />
                <BudgetOverview />
            </div>
        </div>
    );
}
