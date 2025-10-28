import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react"
import { formatCurrency, getBudgetStatus } from "@/hooks/use-budget"

interface BudgetProgressProps {
    overviewData: {
        totalBudget: number;
        totalSpent: number;
        totalRemaining: number;
        percentageUsed: number;
    }
}

export const BudgetProgress = ({ overviewData }: BudgetProgressProps) => {
    const status = getBudgetStatus(overviewData.totalSpent, overviewData.totalBudget);

    // Get progress color based on status
    // const getProgressColor = () => {
    //     switch (status) {
    //         case 'healthy':
    //             return 'bg-green-500';
    //         case 'warning':
    //             return 'bg-yellow-500';
    //         case 'critical':
    //             return 'bg-red-500';
    //         default:
    //             return 'bg-blue-500';
    //     }
    // };

    // Get status badge
    const getStatusBadge = () => {
        switch (status) {
            case 'healthy':
                return (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Healthy Spending
                    </Badge>
                );
            case 'warning':
                return (
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Nearing Limit
                    </Badge>
                );
            case 'critical':
                return (
                    <Badge className="bg-red-100 text-red-800 border-red-200">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Critical Level
                    </Badge>
                );
            default:
                return null;
        }
    };

    // Get status message
    const getStatusMessage = () => {
        const remaining = overviewData.totalRemaining;
        const percentage = 100 - overviewData.percentageUsed;

        if (status === 'critical') {
            return `Only ${formatCurrency(remaining)} (${percentage.toFixed(1)}%) remaining. Consider reallocating resources.`;
        } else if (status === 'warning') {
            return `${formatCurrency(remaining)} (${percentage.toFixed(1)}%) remaining. Monitor spending closely.`;
        } else {
            return `${formatCurrency(remaining)} (${percentage.toFixed(1)}%) available for allocation.`;
        }
    };

    return (
        <Card className="mb-8">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Overall Budget Progress</CardTitle>
                        <CardDescription>Current spending status across all categories</CardDescription>
                    </div>
                    {getStatusBadge()}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Amount Display */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-baseline space-x-2">
                            <span className="text-2xl font-bold text-gray-900">
                                {formatCurrency(overviewData.totalSpent)}
                            </span>
                            <span className="text-sm text-gray-600">
                                of {formatCurrency(overviewData.totalBudget)}
                            </span>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">
                                {overviewData.percentageUsed.toFixed(1)}%
                            </div>
                            <div className="text-xs text-gray-500">
                                utilized
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <Progress
                            value={overviewData.percentageUsed}
                            className="h-3"
                        />

                        {/* Progress Markers */}
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>0%</span>
                            <span className="text-yellow-600">70%</span>
                            <span className="text-red-600">90%</span>
                            <span>100%</span>
                        </div>
                    </div>

                    {/* Status Message */}
                    <div className={`p-3 rounded-lg ${status === 'critical' ? 'bg-red-50 border border-red-200' :
                            status === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                                'bg-green-50 border border-green-200'
                        }`}>
                        <p className={`text-sm ${status === 'critical' ? 'text-red-800' :
                                status === 'warning' ? 'text-yellow-800' :
                                    'text-green-800'
                            }`}>
                            {getStatusMessage()}
                        </p>
                    </div>

                    {/* Breakdown */}
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                            <p className="text-xs text-gray-600 mb-1">Spent</p>
                            <p className="text-lg font-semibold text-red-600">
                                {formatCurrency(overviewData.totalSpent)}
                            </p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                            <p className="text-xs text-gray-600 mb-1">Available</p>
                            <p className="text-lg font-semibold text-green-600">
                                {formatCurrency(overviewData.totalRemaining)}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
