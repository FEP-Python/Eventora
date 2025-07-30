import { BarChart3, PieChart } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const AnalyticsTab = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <BarChart3 className="h-5 w-5" />
                        <span>Spending Trends</span>
                    </CardTitle>
                    <CardDescription>Monthly spending patterns</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-64 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <p>Spending trends chart would appear here</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <PieChart className="h-5 w-5" />
                        <span>Category Distribution</span>
                    </CardTitle>
                    <CardDescription>Budget allocation by category</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-64 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                            <PieChart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <p>Category distribution chart would appear here</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
