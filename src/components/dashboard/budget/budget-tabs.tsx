import { AlertCircle, CheckCircle, TrendingDown, TrendingUp } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { CategoryTab } from "./category-tab";
import { AnalyticsTab } from "./analytics-tab";
import { TransactionTab } from "./transaction-tab";


interface BudgetTabsProps {
    categories: {
        id: number;
        name: string;
        allocated: number;
        spent: number;
        remaining: number;
        percentage: number;
        status: string;
        transactions: number;
        lastUpdated: string;
    }[];
    recentTransactions: {
        id: number;
        description: string;
        amount: number;
        category: string;
        date: string;
        type: string;
        approvedBy: string;
        receipt: boolean;
    }[];
}

export const BudgetTabs = ({ categories, recentTransactions }: BudgetTabsProps) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case "on-track":
                return "bg-blue-100 text-blue-800"
            case "warning":
                return "bg-yellow-100 text-yellow-800"
            case "over-budget":
                return "bg-red-100 text-red-800"
            case "under-budget":
                return "bg-green-100 text-green-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "warning":
                return AlertCircle
            case "over-budget":
                return TrendingUp
            case "under-budget":
                return TrendingDown
            default:
                return CheckCircle
        }
    }

    return (
        <Tabs defaultValue="categories" className="space-y-6">
            <TabsList>
                <TabsTrigger value="categories">Categories</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="categories" className="space-y-6">
                <CategoryTab
                    categories={categories}
                    getStatusIcon={getStatusIcon}
                    getStatusColor={getStatusColor}
                />
            </TabsContent>

            <TabsContent value="transactions" className="space-y-6">
                <TransactionTab
                    recentTransactions={recentTransactions}
                />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
                <AnalyticsTab />
            </TabsContent>
        </Tabs>
    )
}
