'use client';

import { BudgetCard } from "./budget-card";
import type { Budget } from "@/type";

interface BudgetGridProps {
    budgets: Budget[];
}

export const BudgetGrid = ({ budgets }: BudgetGridProps) => {
    if (!budgets || budgets.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No budgets found</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgets.map((budget) => (
                <BudgetCard key={budget.id} budget={budget} />
            ))}
        </div>
    );
};
