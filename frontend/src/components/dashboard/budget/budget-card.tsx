'use client';

import { useState, useEffect } from "react";
import { Edit, Trash2, Plus, Minus, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateBudget, useDeleteBudget, useAddExpense, useRemoveExpense } from "@/hooks/use-budget";
import type { Budget } from "@/type";
import { toast } from "sonner";

interface BudgetCardProps {
    budget: Budget;
}

export const BudgetCard = ({ budget }: BudgetCardProps) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [expenseAmount, setExpenseAmount] = useState("");
    const [expenseType, setExpenseType] = useState<"add" | "remove">("add");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    
    const updateBudgetMutation = useUpdateBudget();
    const deleteBudgetMutation = useDeleteBudget();
    const addExpenseMutation = useAddExpense();
    const removeExpenseMutation = useRemoveExpense();

    // Reset states when any modal closes
    useEffect(() => {
        if (!isEditModalOpen && !isExpenseModalOpen && !isDeleteModalOpen) {
            setExpenseAmount("");
            setDropdownOpen(false);
        }
    }, [isEditModalOpen, isExpenseModalOpen, isDeleteModalOpen]);

    // Prevent body scroll when any modal is open
    useEffect(() => {
        if (isEditModalOpen || isExpenseModalOpen || isDeleteModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isEditModalOpen, isExpenseModalOpen, isDeleteModalOpen]);

    const percentage = budget.totalAmount > 0 ? (budget.spentAmount / budget.totalAmount) * 100 : 0;
    
    const getStatusColor = (percentage: number) => {
        if (percentage >= 90) return "destructive";
        if (percentage >= 75) return "secondary";
        if (percentage >= 50) return "default";
        return "outline";
    };

    const getStatusText = (percentage: number) => {
        if (percentage >= 90) return "Over Budget";
        if (percentage >= 75) return "Warning";
        if (percentage >= 50) return "On Track";
        return "Under Budget";
    };

    const handleEditBudget = async (formData: { name: string; description: string; totalAmount: number }) => {
        try {
            await updateBudgetMutation.mutateAsync({
                budgetId: budget.id.toString(),
                budgetData: formData,
            });
            setIsEditModalOpen(false);
        } catch (error) {
            // Error is handled by the mutation
        }
    };

    const handleDeleteBudget = async () => {
        try {
            await deleteBudgetMutation.mutateAsync(budget.id.toString());
            setIsDeleteModalOpen(false);
        } catch (error) {
            // Error is handled by the mutation
        }
    };

    const handleExpenseAction = async () => {
        if (!expenseAmount || parseFloat(expenseAmount) <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        try {
            if (expenseType === "add") {
                await addExpenseMutation.mutateAsync({
                    budgetId: budget.id.toString(),
                    expenseData: { amount: parseFloat(expenseAmount) },
                });
            } else {
                await removeExpenseMutation.mutateAsync({
                    budgetId: budget.id.toString(),
                    expenseData: { amount: parseFloat(expenseAmount) },
                });
            }
            setExpenseAmount("");
            setIsExpenseModalOpen(false);
        } catch (error) {
            // Error is handled by the mutation
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return new Date().toLocaleDateString();
        try {
            return new Date(dateString).toLocaleDateString();
        } catch (error) {
            return new Date().toLocaleDateString();
        }
    };

    return (
        <>
            <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold">{budget.name}</CardTitle>
                        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onCloseAutoFocus={(e) => e.preventDefault()}>
                                <DropdownMenuItem 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setDropdownOpen(false);
                                        setIsEditModalOpen(true);
                                    }}
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Budget
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setDropdownOpen(false);
                                        setExpenseType("add");
                                        setIsExpenseModalOpen(true);
                                    }}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Expense
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setDropdownOpen(false);
                                        setExpenseType("remove");
                                        setIsExpenseModalOpen(true);
                                    }}
                                >
                                    <Minus className="h-4 w-4 mr-2" />
                                    Remove Expense
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setDropdownOpen(false);
                                        setIsDeleteModalOpen(true);
                                    }}
                                    className="text-red-600"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Budget
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    {budget.description && (
                        <p className="text-sm text-gray-600">{budget.description}</p>
                    )}
                </CardHeader>
                
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{Math.round(percentage).toLocaleString()}%</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                    </div>

                    <div className="flex justify-between flex-wrap gap-4 text-center">
                        <div>
                            <p className="text-2xl font-bold text-green-600">
                                {formatCurrency(budget.totalAmount)}
                            </p>
                            <p className="text-xs text-gray-500">Total Budget</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-red-600">
                                {formatCurrency(budget.spentAmount)}
                            </p>
                            <p className="text-xs text-gray-500">Spent</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-blue-600">
                                {formatCurrency(budget.remainingAmount)}
                            </p>
                            <p className="text-xs text-gray-500">Remaining</p>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <Badge variant={getStatusColor(percentage)}>
                            {getStatusText(percentage)}
                        </Badge>
                    </div>
                    
                    <div className="text-center">
                        <p className="text-xs text-gray-500">
                            Last updated: {formatDate(budget.updatedAt)}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Edit Budget Modal */}
            <EditBudgetModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setDropdownOpen(false);
                }}
                budget={budget}
                onSave={handleEditBudget}
                isLoading={updateBudgetMutation.isPending}
            />

            {/* Expense Modal */}
            <ExpenseModal
                isOpen={isExpenseModalOpen}
                onClose={() => {
                    setIsExpenseModalOpen(false);
                    setDropdownOpen(false);
                }}
                budget={budget}
                expenseType={expenseType}
                amount={expenseAmount}
                onAmountChange={setExpenseAmount}
                onSave={handleExpenseAction}
                isLoading={addExpenseMutation.isPending || removeExpenseMutation.isPending}
            />

            {/* Delete Confirmation Modal */}
            <DeleteBudgetModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setDropdownOpen(false);
                }}
                budget={budget}
                onConfirm={handleDeleteBudget}
                isLoading={deleteBudgetMutation.isPending}
            />
        </>
    );
};

// Edit Budget Modal Component
interface EditBudgetModalProps {
    isOpen: boolean;
    onClose: () => void;
    budget: Budget;
    onSave: (data: { name: string; description: string; totalAmount: number }) => void;
    isLoading: boolean;
}

const EditBudgetModal = ({ isOpen, onClose, budget, onSave, isLoading }: EditBudgetModalProps) => {
    const [formData, setFormData] = useState({
        name: budget.name,
        description: budget.description || "",
        totalAmount: budget.totalAmount.toString(),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            name: formData.name,
            description: formData.description,
            totalAmount: parseFloat(formData.totalAmount),
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Edit Budget</DialogTitle>
                    <DialogDescription>
                        Update the budget details below.
                    </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-name">Budget Name</Label>
                        <Input
                            id="edit-name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-description">Description</Label>
                        <Input
                            id="edit-description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-total">Total Amount</Label>
                        <Input
                            id="edit-total"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.totalAmount}
                            onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: e.target.value }))}
                            required
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

// Expense Modal Component
interface ExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    budget: Budget;
    expenseType: "add" | "remove";
    amount: string;
    onAmountChange: (amount: string) => void;
    onSave: () => void;
    isLoading: boolean;
}

const ExpenseModal = ({ isOpen, onClose, budget, expenseType, amount, onAmountChange, onSave, isLoading }: ExpenseModalProps) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>
                        {expenseType === "add" ? "Add Expense" : "Remove Expense"}
                    </DialogTitle>
                    <DialogDescription>
                        {expenseType === "add" 
                            ? `Add an expense to "${budget.name}" budget.`
                            : `Remove an expense from "${budget.name}" budget.`
                        }
                    </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="expense-amount">Amount</Label>
                        <Input
                            id="expense-amount"
                            type="number"
                            step="0.01"
                            min="0"
                            value={amount}
                            onChange={(e) => onAmountChange(e.target.value)}
                            placeholder="0.00"
                            required
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            variant={expenseType === "add" ? "default" : "destructive"}
                            disabled={isLoading}
                        >
                            {isLoading ? "Processing..." : `${expenseType === "add" ? "Add" : "Remove"} Expense`}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

// Delete Confirmation Modal Component
interface DeleteBudgetModalProps {
    isOpen: boolean;
    onClose: () => void;
    budget: Budget;
    onConfirm: () => void;
    isLoading: boolean;
}

const DeleteBudgetModal = ({ isOpen, onClose, budget, onConfirm, isLoading }: DeleteBudgetModalProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Delete Budget</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete the budget "{budget.name}"? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button type="button" variant="destructive" onClick={onConfirm} disabled={isLoading}>
                        {isLoading ? "Deleting..." : "Delete Budget"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
