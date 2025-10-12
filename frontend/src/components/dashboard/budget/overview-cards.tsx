import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Receipt, TrendingDown, TrendingUp } from "lucide-react";

interface BudgetOverviewCardsProps {
    overviewData: {
        totalBudget: number;
        totalSpent: number;
        totalRemaining: number;
        percentageUsed: number;
    };
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
}

export const BudgetOverviewCards = ({ overviewData, categories }: BudgetOverviewCardsProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Total Budget</p>
                            <p className="text-2xl font-bold text-gray-900">₹{overviewData.totalBudget.toLocaleString()}</p>
                        </div>
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                            <DollarSign className="h-6 w-6" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Total Spent</p>
                            <p className="text-2xl font-bold text-red-600">₹{overviewData.totalSpent.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">{overviewData.percentageUsed.toLocaleString() + "% used"}</p>
                        </div>
                        <div className="p-3 rounded-full bg-red-100 text-red-600">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Remaining</p>
                            <p className="text-2xl font-bold text-green-600">
                                ₹{overviewData.totalRemaining.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">{(100 - overviewData.percentageUsed).toLocaleString() + "% left"}</p>
                        </div>
                        <div className="p-3 rounded-full bg-green-100 text-green-600">
                            <TrendingDown className="h-6 w-6" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Transactions</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {categories.reduce((sum, cat) => sum + cat.transactions, 0)}
                            </p>
                            <p className="text-xs text-gray-500">This {new Date().toLocaleString('default', { month: 'long' })}</p>
                        </div>
                        <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                            <Receipt className="h-6 w-6" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
