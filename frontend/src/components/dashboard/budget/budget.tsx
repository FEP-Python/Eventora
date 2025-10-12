'use client';

import { useState } from "react";
import { Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BudgetProgress } from "./budget-progress";
import { BudgetOverviewCards } from "./overview-cards";
import { CreateBudgetModal } from "./create-budget-modal";
import { BudgetGrid } from "./budget-grid";
import { useOrgId } from "@/hooks/use-org-id";
import { useGetBudgetAnalytics, useGetAllBudgets } from "@/hooks/use-budget";
import type { Budget } from "@/type";

export const BudgetComponent = () => {
    const orgId = useOrgId();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useGetBudgetAnalytics(orgId);
    const { data: budgets, isLoading: budgetsLoading, error: budgetsError } = useGetAllBudgets(orgId);

    // Transform analytics data for the overview
    const overviewData = analytics ? {
        totalBudget: analytics.totalBudgetAmount,
        totalSpent: analytics.totalSpentAmount,
        totalRemaining: analytics.totalRemainingAmount,
        percentageUsed: analytics.utilizationPercentage,
    } : {
        totalBudget: 0,
        totalSpent: 0,
        totalRemaining: 0,
        percentageUsed: 0,
    };

    // Transform budgets data for categories
    const categories = budgets?.map((budget: Budget) => {
        const percentage = budget.totalAmount > 0 ? (budget.spentAmount / budget.totalAmount) * 100 : 0;
        let status = "under-budget";
        
        if (percentage >= 90) {
            status = "over-budget";
        } else if (percentage >= 75) {
            status = "warning";
        } else if (percentage >= 50) {
            status = "on-track";
        }

        return {
            id: budget.id,
            name: budget.name,
            allocated: budget.totalAmount,
            spent: budget.spentAmount,
            remaining: budget.remainingAmount,
            percentage: Math.round(percentage),
            status,
            transactions: 0, // This would need to be implemented with transaction tracking
            lastUpdated: budget.updatedAt ? new Date(budget.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        };
    }) || [];

    // Mock transactions data - this would need to be implemented with a transactions API
    const recentTransactions = [
        {
            id: 1,
            description: "Audio equipment rental",
            amount: -5000,
            category: "Venue & Equipment",
            date: "2024-03-10",
            type: "expense",
            approvedBy: "Sarah Chen",
            receipt: true,
        },
        {
            id: 2,
            description: "Social media advertising",
            amount: -2500,
            category: "Marketing & Promotion",
            date: "2024-03-09",
            type: "expense",
            approvedBy: "David Brown",
            receipt: true,
        },
        {
            id: 3,
            description: "Speaker travel reimbursement",
            amount: -1500,
            category: "Speakers & Guests",
            date: "2024-03-08",
            type: "expense",
            approvedBy: "Lisa Wang",
            receipt: false,
        },
        {
            id: 4,
            description: "Catering deposit",
            amount: -3000,
            category: "Food & Catering",
            date: "2024-03-07",
            type: "expense",
            approvedBy: "Mike Johnson",
            receipt: true,
        },
        {
            id: 5,
            description: "Sponsorship received",
            amount: 10000,
            category: "Income",
            date: "2024-03-06",
            type: "income",
            approvedBy: "Sarah Chen",
            receipt: true,
        },
    ];

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
                        Create your first budget category to start tracking expenses and managing your club's finances.
                    </p>
                    <Button 
                        variant="green" 
                        className="flex items-center"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <Plus className="h-4 w-4" />
                        Create Your First Budget
                    </Button>
                </div>
                <CreateBudgetModal 
                    isOpen={isCreateModalOpen} 
                    onClose={() => setIsCreateModalOpen(false)} 
                />
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Budget Management</h1>
                    <p className="text-gray-600">Track expenses and manage your organization&apos;s finances</p>
                </div>
                <div className="flex items-center space-x-3">
                    <Button 
                        variant="green" 
                        className="flex items-center"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <Plus className="h-4 w-4" />
                        <span>Create Budget</span>
                    </Button>
                </div>
            </div>

            <BudgetOverviewCards overviewData={overviewData} categories={categories} />
            <BudgetProgress overviewData={overviewData} />
            
            {/* Budget Grid Section */}
            <div className="my-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Budget Categories</h2>
                        <p className="text-gray-600 mt-1">
                            {budgets.length} {budgets.length === 1 ? 'budget' : 'budgets'} created
                        </p>
                    </div>
                </div>
                <BudgetGrid budgets={budgets} />
            </div>
            
            <CreateBudgetModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
            />
        </div>
    )
}
