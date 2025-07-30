import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"


interface BudgetProgressProps {
    overviewData: {
        totalBudget: number;
        totalSpent: number;
        totalRemaining: number;
        percentageUsed: number;
    }
}

export const BudgetProgress = ({ overviewData }: BudgetProgressProps) => {
    return (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle>Overall Budget Progress</CardTitle>
                <CardDescription>Current spending status across all categories</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">
                            ₹{overviewData.totalSpent.toLocaleString()} of ₹{overviewData.totalBudget.toLocaleString()}
                        </span>
                        <span className="text-sm font-medium text-gray-900">{overviewData.percentageUsed}%</span>
                    </div>
                    <Progress value={overviewData.percentageUsed} className="h-2" />
                </div>
            </CardContent>
        </Card>
    )
}
