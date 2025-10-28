'use client';

import { useState } from "react";
import { Plus, ShieldCheck, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BudgetProgress } from "./budget-progress";
import { BudgetOverviewCards } from "./overview-cards";
import { CreateBudgetModal } from "./create-budget-modal";
import { BudgetGrid } from "./budget-grid";
import { useOrgId } from "@/hooks/use-org-id";
import { useGetBudgetAnalytics, useGetAllBudgets, canManageBudget } from "@/hooks/use-budget";
import { useOrgMembers } from "@/hooks/use-org";
import { useCurrentUser } from "@/hooks/use-auth";

export const BudgetComponent = () => {
    const orgId = useOrgId();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Fetch data
    const { data: currentUser } = useCurrentUser();
    const { data: orgMembers } = useOrgMembers(Number(orgId));
    const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useGetBudgetAnalytics(Number(orgId));
    const { data: budgets, isLoading: budgetsLoading, error: budgetsError } = useGetAllBudgets(Number(orgId));

    // Check user permissions
    const currentUserOrgMember = orgMembers?.find((member) => member.id === currentUser?.id);
    const userRole = currentUserOrgMember?.orgRole;
    const canManage = canManageBudget(userRole);

    // Transform analytics data for the overview
    const overviewData = analytics ? {
        totalBudget: analytics.totalBudgetAmount,
        totalSpent: analytics.totalSpentAmount,
        totalRemaining: analytics.totalRemainingAmount,
        percentageUsed: analytics.utilizationPercentage,
        totalBudgets: analytics.totalBudgets,
    } : {
        totalBudget: 0,
        totalSpent: 0,
        totalRemaining: 0,
        percentageUsed: 0,
        totalBudgets: 0,
    };

    // Loading state
    if (analyticsLoading || budgetsLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading budget data...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (analyticsError || budgetsError) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Failed to load budget data</p>
                    <Button onClick={() => window.location.reload()}>
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    // Empty state
    if (!budgets || budgets.length === 0) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <div className="text-center flex flex-col items-center justify-center max-w-md">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Plus className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Budgets Found</h3>
                    <p className="text-gray-600 mb-6 text-center">
                        {canManage
                            ? "Create your first budget category to start tracking expenses and managing your organization's finances."
                            : "No budgets have been created yet. Only leaders and co-leaders can create budgets."
                        }
                    </p>
                    {canManage ? (
                        <Button
                            variant="green"
                            className="flex items-center"
                            onClick={() => setIsCreateModalOpen(true)}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Create Your First Budget
                        </Button>
                    ) : (
                        <Alert className="max-w-md">
                            <Lock className="h-4 w-4" />
                            <AlertDescription>
                                Budget management is restricted to organization leaders and co-leaders.
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
                {canManage && (
                    <CreateBudgetModal
                        isOpen={isCreateModalOpen}
                        onClose={() => setIsCreateModalOpen(false)}
                    />
                )}
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Budget Management</h1>
                    <p className="text-gray-600">Track expenses and manage your organization&apos;s finances</p>
                    <div className="mt-2">
                        {canManage ? (
                            <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                                <ShieldCheck className="h-3 w-3" />
                                Can Manage Budgets
                            </Badge>
                        ) : (
                            <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                                <Lock className="h-3 w-3" />
                                View Only Access
                            </Badge>
                        )}
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    {canManage ? (
                        <Button
                            variant="green"
                            className="flex items-center"
                            onClick={() => setIsCreateModalOpen(true)}
                        >
                            <Plus className="h-4 w-4" />
                            <span>Create Budget</span>
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            disabled
                            className="flex items-center cursor-not-allowed"
                        >
                            <Lock className="h-4 w-4" />
                            <span>Create Budget</span>
                        </Button>
                    )}
                </div>
            </div>

            {/* Permission Notice */}
            {!canManage && (
                <Alert className="mb-6 bg-blue-50 border-blue-200">
                    <Lock className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-900">
                        You have view-only access to budgets. Only club leaders and co-leaders can create, edit, or manage budgets.
                    </AlertDescription>
                </Alert>
            )}

            {/* Overview Cards */}
            <BudgetOverviewCards overviewData={overviewData} />

            {/* Progress Bar */}
            <BudgetProgress overviewData={overviewData} />

            {/* Budget Grid Section */}
            <div className="my-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Budget Categories</h2>
                        <p className="text-gray-600 mt-1">
                            {budgets.length} {budgets.length === 1 ? 'budget' : 'budgets'} •
                            ₹{overviewData.totalBudget.toLocaleString()} total allocated
                        </p>
                    </div>
                </div>
                <BudgetGrid budgets={budgets} canManage={canManage} />
            </div>

            {/* Create Budget Modal */}
            {canManage && (
                <CreateBudgetModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                />
            )}
        </div>
    )
}
