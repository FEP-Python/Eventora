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
import { useOrgDashboard } from "@/hooks/use-dashboard";
import { useRequireOrganization } from "@/utils/org-client-guard";
import { BudgetComponent } from "./budget/budget";
import { useOrgId } from "@/hooks/use-org-id";
import { useGetBudgetAnalytics } from "@/hooks/use-budget";
import { DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

export const Dashboard = () => {
    const orgId = useOrgId();
    const { data: analytics } = useGetBudgetAnalytics(orgId);
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    const { activeOrg } = useOrgStore();
    const { isAuthenticated } = useIsAuthenticated();
    const { data } = useOrgDashboard(activeOrg?.id || 0);
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

    if (!isMounted) return null;

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#344E41] mb-2">Welcome back {activeOrg?.name} to Eventora</h1>
                <p className="text-[#3A5A40]">Here&apos;s what&apos;s happening with your club today.</p>
            </div>

            <StatsGrid
                totalEvents={data?.totalEvents || 0}
                totalMembers={data?.totalMembers || 0}
                totalTeams={data?.totalTeams || 0}
                totalBudget={`₹${(analytics?.totalBudgetAmount ?? 0).toLocaleString()}`}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-1">
                    <QuickActions />
                </div>
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <UpcomingEvents
                        orgId={activeOrg?.id || 0}
                        events={data?.recentEvents || []}
                    />
                    <Card>
                        <CardHeader>
                            <CardTitle>Budget Overview</CardTitle>
                            <CardDescription>Financial tracking and allocation</CardDescription>
                        </CardHeader>
                        <CardContent className="w-full">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                                <div className="flex items-center justify-between w-full gap-6">
                                    <div className="rounded-xl bg-blue-50 py-4 px-10 flex flex-col items-center w-full">
                                        <p className="text-xs text-blue-800 mb-1 font-medium flex items-center gap-2 mb-2">
                                            <DollarSign className="w-4 h-4" /> 
                                            <span className="text-nowrap">Total Budget</span>
                                        </p>
                                        <div className="text-2xl font-semibold text-blue-600">₹{(analytics?.totalBudgetAmount ?? 0).toLocaleString()}</div>
                                    </div>

                                    <div className="rounded-xl bg-green-50 py-4 px-10 flex flex-col items-center w-full">
                                        <p className="text-xs text-green-800 mb-1 font-medium flex items-center gap-2 mb-2">
                                            <TrendingUp className="w-4 h-4" /> 
                                            <span className="text-nowrap">Total Spent</span>
                                        </p>
                                        <div className="text-2xl font-semibold text-green-600">₹{(analytics?.totalSpentAmount ?? 0).toLocaleString()}</div>
                                    </div>

                                    <div className="rounded-xl bg-red-50 py-4 px-10 flex flex-col items-center w-full">
                                        <p className="text-xs text-red-800 mb-1 font-medium flex items-center gap-2 mb-2">
                                            <TrendingDown className="w-4 h-4" /> 
                                            <span className="text-nowrap">Total Remaining</span>
                                        </p>
                                        <div className="text-2xl font-semibold text-red-600">₹{(analytics?.totalRemainingAmount ?? 0).toLocaleString()}</div>
                                    </div>

                                    <div className="rounded-xl bg-fuchsia-50 py-4 px-10 flex flex-col items-center w-full">
                                        <p className="text-xs text-fuchsia-800 mb-1 font-medium mb-2">Utilization</p>
                                        <div className="text-2xl font-semibold text-fuchsia-600">
                                            {(analytics?.utilizationPercentage ?? 0).toFixed(1)}%
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
