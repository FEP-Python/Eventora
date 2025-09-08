'use client';

import { useEffect, useState } from "react";
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
    const [isMounted, setIsMounted] = useState(false);

    const { activeOrg } = useOrgStore();
    const { isAuthenticated } = useIsAuthenticated();
    const { hasOrganizations, isLoading: orgLoading } = useRequireOrganization();

    useEffect(() => {
        if (!isAuthenticated) {
            return router.push('/sign-in');
        }
    }, [isAuthenticated, router]);

    useEffect(() => {
        setIsMounted(true);
    }, [setIsMounted]);

    if (!isAuthenticated) {
      return <div>Redirecting to login...</div>;
    }

    if (orgLoading) {
      return <div>Checking your organizations...</div>;
    }

    if (!hasOrganizations) {
      return <div>Redirecting to organization creation...</div>;
    }

    if(!isMounted) return null;

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
