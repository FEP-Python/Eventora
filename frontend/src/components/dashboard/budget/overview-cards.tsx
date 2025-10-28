import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { formatCurrency, getBudgetStatus } from "@/hooks/use-budget";

interface BudgetOverviewCardsProps {
    overviewData: {
        totalBudget: number;
        totalSpent: number;
        totalRemaining: number;
        percentageUsed: number;
        totalBudgets: number;
    };
}

export const BudgetOverviewCards = ({ overviewData }: BudgetOverviewCardsProps) => {
    const budgetStatus = getBudgetStatus(overviewData.totalSpent, overviewData.totalBudget);

    // Get status color
    const getStatusColor = () => {
        switch (budgetStatus) {
            case 'healthy':
                return 'text-green-600';
            case 'warning':
                return 'text-yellow-600';
            case 'critical':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    const getStatusText = () => {
        switch (budgetStatus) {
            case 'healthy':
                return 'Healthy';
            case 'warning':
                return 'Warning';
            case 'critical':
                return 'Critical';
            default:
                return 'Good';
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Budget */}
            <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600 mb-1">Total Budget</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatCurrency(overviewData.totalBudget)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {overviewData.totalBudgets} budget{overviewData.totalBudgets !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                            <DollarSign className="h-6 w-6" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Total Spent */}
            <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600 mb-1">Total Spent</p>
                            <p className={`text-2xl font-bold ${getStatusColor()}`}>
                                {formatCurrency(overviewData.totalSpent)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {overviewData.percentageUsed.toFixed(1)}% utilized
                            </p>
                        </div>
                        <div className={`p-3 rounded-full ${budgetStatus === 'healthy' ? 'bg-green-100 text-green-600' :
                                budgetStatus === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                                    'bg-red-100 text-red-600'
                            }`}>
                            <TrendingUp className="h-6 w-6" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Remaining */}
            <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600 mb-1">Remaining</p>
                            <p className="text-2xl font-bold text-green-600">
                                {formatCurrency(overviewData.totalRemaining)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {(100 - overviewData.percentageUsed).toFixed(1)}% available
                            </p>
                        </div>
                        <div className="p-3 rounded-full bg-green-100 text-green-600">
                            <TrendingDown className="h-6 w-6" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Budget Status */}
            <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600 mb-1">Budget Status</p>
                            <p className={`text-2xl font-bold ${getStatusColor()}`}>
                                {getStatusText()}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Overall health
                            </p>
                        </div>
                        <div className={`p-3 rounded-full ${budgetStatus === 'healthy' ? 'bg-green-100 text-green-600' :
                                budgetStatus === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                                    'bg-red-100 text-red-600'
                            }`}>
                            <Wallet className="h-6 w-6" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
