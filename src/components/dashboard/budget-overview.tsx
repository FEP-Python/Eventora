import { AlertCircle, CheckCircle, DollarSign, TrendingDown, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export const BudgetOverview = () => {
    const budgetData = {
        total: 100000,
        used: 45000,
        remaining: 55000,
        percentage: 45,
    }

    const categories = [
        {
            name: "Venue & Equipment",
            allocated: 30000,
            spent: 18000,
            percentage: 60,
            status: "on-track",
        },
        {
            name: "Marketing & Promotion",
            allocated: 15000,
            spent: 12000,
            percentage: 80,
            status: "warning",
        },
        {
            name: "Food & Catering",
            allocated: 25000,
            spent: 8000,
            percentage: 32,
            status: "under-budget",
        },
        {
            name: "Speakers & Guests",
            allocated: 20000,
            spent: 5000,
            percentage: 25,
            status: "under-budget",
        },
        {
            name: "Miscellaneous",
            allocated: 10000,
            spent: 2000,
            percentage: 20,
            status: "under-budget",
        },
    ]

    const getStatusColor = (status: string) => {
        switch (status) {
            case "on-track":
                return "bg-[#A3B18A]/20 text-[#3A5A40] border-[#A3B18A]/30"
            case "warning":
                return "bg-yellow-100 text-yellow-800 border-yellow-200"
            case "over-budget":
                return "bg-red-100 text-red-800 border-red-200"
            case "under-budget":
                return "bg-[#588157]/20 text-[#3A5A40] border-[#588157]/30"
            default:
                return "bg-[#DAD7CD]/50 text-[#3A5A40] border-[#A3B18A]/30"
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
        <Card className="bg-white/80 backdrop-blur-sm border-[#A3B18A]/20">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center space-x-2 text-[#344E41]">
                            <DollarSign className="h-5 w-5" />
                            <span className="text-lg font-semibold">Budget Overview</span>
                        </CardTitle>
                        <CardDescription className="text-[#3A5A40]">Financial tracking and allocation</CardDescription>
                    </div>
                    <Link href="/dashboard/budget">
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-[#A3B18A]/30 text-[#3A5A40] hover:bg-[#A3B18A]/10 bg-transparent"
                        >
                            View Details
                        </Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent>
                {/* Total Budget Summary */}
                <div className="mb-6 p-4 bg-[#DAD7CD]/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-[#3A5A40]">Total Budget</span>
                        <span className="text-lg font-bold text-[#344E41]">₹{budgetData.total.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-4">
                            <div className="text-sm">
                                <span className="text-[#3A5A40]">Used: </span>
                                <span className="font-medium text-red-600">₹{budgetData.used.toLocaleString()}</span>
                            </div>
                            <div className="text-sm">
                                <span className="text-[#3A5A40]">Remaining: </span>
                                <span className="font-medium text-[#588157]">₹{budgetData.remaining.toLocaleString()}</span>
                            </div>
                        </div>
                        <span className="text-sm font-medium text-[#344E41]">{budgetData.percentage}%</span>
                    </div>
                    <Progress value={budgetData.percentage} className="h-3" />
                </div>

                {/* Category Breakdown */}
                <div className="space-y-4">
                    <h4 className="font-medium text-[#344E41] mb-3">Category Breakdown</h4>
                    {categories.map((category, index) => {
                        const StatusIcon = getStatusIcon(category.status)
                        return (
                            <div key={index} className="border border-[#A3B18A]/20 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                        <StatusIcon className="h-4 w-4 text-[#588157]" />
                                        <span className="font-medium text-[#344E41]">{category.name}</span>
                                    </div>
                                    <Badge className={getStatusColor(category.status)}>{category.status.replace("-", " ")}</Badge>
                                </div>

                                <div className="flex items-center justify-between mb-2 text-sm text-[#3A5A40]">
                                    <span>
                                        ₹{category.spent.toLocaleString()} / ₹{category.allocated.toLocaleString()}
                                    </span>
                                    <span>{category.percentage}%</span>
                                </div>

                                <Progress value={category.percentage} className="h-2" />
                            </div>
                        )
                    })}
                </div>

                {/* Quick Actions */}
                <div className="mt-6 pt-4 border-t border-[#A3B18A]/20">
                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border-[#A3B18A]/30 text-[#3A5A40] hover:bg-[#A3B18A]/10 bg-transparent"
                        >
                            Add Expense
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border-[#A3B18A]/30 text-[#3A5A40] hover:bg-[#A3B18A]/10 bg-transparent"
                        >
                            Generate Report
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
