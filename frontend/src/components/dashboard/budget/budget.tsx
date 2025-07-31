import { Download, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { BudgetTabs } from "./budget-tabs";
import { BudgetProgress } from "./budget-progress";
import { BudgetOverviewCards } from "./overview-cards";


export const Budget = () => {
    const overviewData = {
        totalBudget: 100000,
        totalSpent: 60000,
        totalRemaining: 40000,
        percentageUsed: 60,
    }

    const categories = [
        {
            id: 1,
            name: "Venue & Equipment",
            allocated: 30000,
            spent: 18000,
            remaining: 12000,
            percentage: 60,
            status: "on-track",
            transactions: 8,
            lastUpdated: "2024-03-10",
        },
        {
            id: 2,
            name: "Marketing & Promotion",
            allocated: 15000,
            spent: 12000,
            remaining: 3000,
            percentage: 80,
            status: "warning",
            transactions: 12,
            lastUpdated: "2024-03-09",
        },
        {
            id: 3,
            name: "Food & Catering",
            allocated: 25000,
            spent: 8000,
            remaining: 17000,
            percentage: 32,
            status: "under-budget",
            transactions: 5,
            lastUpdated: "2024-03-08",
        },
        {
            id: 4,
            name: "Speakers & Guests",
            allocated: 20000,
            spent: 5000,
            remaining: 15000,
            percentage: 25,
            status: "under-budget",
            transactions: 3,
            lastUpdated: "2024-03-07",
        },
        {
            id: 5,
            name: "Miscellaneous",
            allocated: 10000,
            spent: 2000,
            remaining: 8000,
            percentage: 20,
            status: "under-budget",
            transactions: 6,
            lastUpdated: "2024-03-06",
        },
    ];

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

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Budget Management</h1>
                    <p className="text-gray-600">Track expenses and manage your organization&apos;s finances</p>
                </div>
                <div className="flex items-center space-x-3">
                    <Button variant="outline" className="flex items-center">
                        <Download className="h-4 w-4" />
                        <span>Export</span>
                    </Button>
                    <Button variant="green" className="flex items-center">
                        <Plus className="h-4 w-4" />
                        <span>Add Expense</span>
                    </Button>
                </div>
            </div>

            <BudgetOverviewCards overviewData={overviewData} categories={categories} />
            <BudgetProgress overviewData={overviewData} />
            <BudgetTabs categories={categories} recentTransactions={recentTransactions} />
        </div>
    )
}
