'use client';

import { BudgetCard } from "./budget-card";
import type { Budget } from "@/type";

interface BudgetGridProps {
    budgets: Budget[];
    canManage?: boolean;
}

export const BudgetGrid = ({ budgets, canManage = false }: BudgetGridProps) => {
    if (!budgets || budgets.length === 0) {
        return (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                <p className="text-gray-500 text-lg mb-2">No budgets found</p>
                <p className="text-gray-400 text-sm">
                    {canManage
                        ? "Create your first budget to get started"
                        : "No budgets have been created yet"
                    }
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgets.map((budget) => (
                <BudgetCard
                    key={budget.id}
                    budget={budget}
                    canManage={canManage}
                />
            ))}
        </div>
    );
};
