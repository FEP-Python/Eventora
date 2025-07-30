"use client";

import { useState } from "react"
import { Filter, Receipt, Search, TrendingDown, TrendingUp } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"


interface TransactionTabProps {
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

export const TransactionTab = ({ recentTransactions }: TransactionTabProps) => {
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <>
            <div className="flex items-center space-x-4">
                <div className="flex-1 max-w-md relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-[#f9fafb] focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <Button variant="outline" className="flex items-center">
                    <Filter className="h-4 w-4" />
                    <span>Filter</span>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>Latest financial activities and expenses</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentTransactions.map((transaction) => (
                            <div
                                key={transaction.id}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center space-x-4">
                                    <div
                                        className={`p-2 rounded-full ${transaction.type === "income"
                                            ? "bg-green-100 text-green-600"
                                            : "bg-red-100 text-red-600"
                                            }`}
                                    >
                                        {transaction.type === "income" ? (
                                            <TrendingUp className="h-4 w-4" />
                                        ) : (
                                            <TrendingDown className="h-4 w-4" />
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="font-medium text-gray-900">{transaction.description}</h3>
                                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                                            <span>{transaction.category}</span>
                                            <span>•</span>
                                            <span>{new Date(transaction.date).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span>Approved by {transaction.approvedBy}</span>
                                            {transaction.receipt && (
                                                <>
                                                    <span>•</span>
                                                    <div className="flex items-center space-x-1">
                                                        <Receipt className="h-3 w-3" />
                                                        <span>Receipt</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p
                                        className={`text-lg font-semibold ${transaction.amount > 0 ? "text-green-600" : "text-red-600"
                                            }`}
                                    >
                                        {transaction.amount > 0 ? "+" : ""}₹{Math.abs(transaction.amount).toLocaleString()}
                                    </p>
                                    <Badge variant={transaction.type === "income" ? "default" : "secondary"}>
                                        {transaction.type}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </>
    )
}
