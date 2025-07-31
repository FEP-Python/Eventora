import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";


interface CategoryTabProps {
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
    getStatusIcon: (status: string) => React.ComponentType<{ className?: string }>;
    getStatusColor: (status: string) => string;
}

export const CategoryTab = ({ categories, getStatusIcon, getStatusColor }: CategoryTabProps) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {categories.map((category) => {
                const StatusIcon = getStatusIcon(category.status)
                return (
                    <Card key={category.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-lg">{category.name}</CardTitle>
                                    <CardDescription className="text-sm">
                                        {category.transactions} transactions
                                    </CardDescription>
                                </div>
                                <Badge className={getStatusColor(category.status)}>
                                    <StatusIcon className="h-3 w-3 mr-1" />
                                    {category.status.replace("-", " ")}
                                </Badge>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {/* Budget Breakdown */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Allocated</span>
                                    <span className="font-medium">₹{category.allocated.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Spent</span>
                                    <span className="font-medium text-red-600">₹{category.spent.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Remaining</span>
                                    <span className="font-medium text-green-600">₹{category.remaining.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Usage</span>
                                    <span className="text-sm font-medium">{category.percentage}%</span>
                                </div>
                                <Progress value={category.percentage} className="h-2" />
                            </div>

                            {/* Last Updated */}
                            <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-200">
                                <div className="flex items-center space-x-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>Updated {new Date(category.lastUpdated).toLocaleDateString()}</span>
                                </div>
                                <Button variant="ghost" size="sm" className="h-6 text-xs">
                                    View Details
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    );
}
