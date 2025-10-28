'use client';

import { useState, useEffect } from "react";
import { Edit, Trash2, Plus, Minus, MoreVertical, Lock, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
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
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
    useUpdateBudget,
    useDeleteBudget,
    useAddExpense,
    useRemoveExpense,
    formatCurrency,
    getBudgetStatus,
    calculateBudgetUtilization
} from "@/hooks/use-budget";
import type { Budget } from "@/type";
import { toast } from "sonner";

interface BudgetCardProps {
    budget: Budget;
    canManage?: boolean;
}

export const BudgetCard = ({ budget, canManage = false }: BudgetCardProps) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [expenseAmount, setExpenseAmount] = useState("");
    const [expenseType, setExpenseType] = useState<"add" | "remove">("add");
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const updateBudgetMutation = useUpdateBudget(budget.id);
    const deleteBudgetMutation = useDeleteBudget();
    const addExpenseMutation = useAddExpense(budget.id);
    const removeExpenseMutation = useRemoveExpense(budget.id);

    // Reset states when any modal closes
    useEffect(() => {
        if (!isEditModalOpen && !isExpenseModalOpen && !isDeleteModalOpen) {
            setExpenseAmount("");
            setDropdownOpen(false);
        }
    }, [isEditModalOpen, isExpenseModalOpen, isDeleteModalOpen]);

    const percentage = calculateBudgetUtilization(budget.spentAmount, budget.totalAmount);
    const status = getBudgetStatus(budget.spentAmount, budget.totalAmount);

    const getStatusColor = () => {
        switch (status) {
            case 'healthy':
                return "bg-green-100 text-green-800 border-green-200";
            case 'warning':
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case 'critical':
                return "bg-red-100 text-red-800 border-red-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'healthy':
                return "Healthy";
            case 'warning':
                return "Warning";
            case 'critical':
                return "Critical";
            default:
                return "Normal";
        }
    };

    const getProgressColor = () => {
        switch (status) {
            case 'healthy':
                return "[&>div]:bg-green-500";
            case 'warning':
                return "[&>div]:bg-yellow-500";
            case 'critical':
                return "[&>div]:bg-red-500";
            default:
                return "[&>div]:bg-blue-500";
        }
    };

    const handleEditBudget = async (formData: { name: string; description: string; totalAmount: number }) => {
        try {
            await updateBudgetMutation.mutateAsync(formData);
            setIsEditModalOpen(false);
        } catch {
            // Error is handled by the mutation
        }
    };

    const handleDeleteBudget = async () => {
        try {
            await deleteBudgetMutation.mutateAsync(budget.id);
            setIsDeleteModalOpen(false);
        } catch {
            // Error is handled by the mutation
        }
    };

    const handleExpenseAction = async () => {
        const amount = parseFloat(expenseAmount);

        if (!expenseAmount || amount <= 0) {
            toast.error("Please enter a valid amount greater than 0");
            return;
        }

        if (expenseType === "add" && (budget.spentAmount + amount) > budget.totalAmount) {
            toast.error("This expense would exceed the total budget");
            return;
        }

        if (expenseType === "remove" && amount > budget.spentAmount) {
            toast.error("Cannot remove more than the spent amount");
            return;
        }

        try {
            if (expenseType === "add") {
                await addExpenseMutation.mutateAsync({ amount });
            } else {
                await removeExpenseMutation.mutateAsync({ amount });
            }
            setExpenseAmount("");
            setIsExpenseModalOpen(false);
        } catch {
            // Error is handled by the mutation
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return new Date().toLocaleDateString();
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch {
            return new Date().toLocaleDateString();
        }
    };

    return (
        <>
            <Card className="hover:shadow-lg transition-all duration-200 border-2">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <CardTitle className="text-lg font-semibold mb-1 flex items-center gap-2">
                                {budget.name}
                                <Badge variant="outline" className={getStatusColor()}>
                                    {getStatusText()}
                                </Badge>
                            </CardTitle>
                            {budget.description && (
                                <p className="text-sm text-gray-600 line-clamp-2">{budget.description}</p>
                            )}
                        </div>
                        {canManage ? (
                            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
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
                                    <DropdownMenuSeparator />
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
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setDropdownOpen(false);
                                            setIsDeleteModalOpen(true);
                                        }}
                                        className="text-red-600 focus:text-red-600"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete Budget
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled>
                                            <Lock className="h-4 w-4 text-gray-400" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Only leaders can manage budgets</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Progress Section */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                            <span className="text-gray-600">Budget Progress</span>
                            <span className="text-gray-900">{percentage.toFixed(1)}%</span>
                        </div>
                        <Progress value={percentage} className={`h-2 ${getProgressColor()}`} />
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>{formatCurrency(budget.spentAmount)} spent</span>
                            <span>{formatCurrency(budget.remainingAmount)} left</span>
                        </div>
                    </div>

                    {/* Amount Cards */}
                    <div className="flex items-center justify-center gap-1">
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 w-full">
                            <div className="flex items-center gap-1 mb-1">
                                <TrendingUp className="h-3 w-3 text-blue-600" />
                                <p className="text-xs text-blue-800 font-medium">Allocated</p>
                            </div>
                            <p className="text-lg font-bold text-blue-600">
                                {formatCurrency(budget.totalAmount)}
                            </p>
                        </div>
                        <div className="p-3 bg-red-50 rounded-lg border border-red-100 w-full">
                            <div className="flex items-center gap-1 mb-1">
                                <Minus className="h-3 w-3 text-red-600" />
                                <p className="text-xs text-red-800 font-medium">Spent</p>
                            </div>
                            <p className="text-lg font-bold text-red-600">
                                {formatCurrency(budget.spentAmount)}
                            </p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg border border-green-100 w-full">
                            <div className="flex items-center gap-1 mb-1">
                                <TrendingDown className="h-3 w-3 text-green-600" />
                                <p className="text-xs text-green-800 font-medium">Left</p>
                            </div>
                            <p className="text-lg font-bold text-green-600">
                                {formatCurrency(budget.remainingAmount)}
                            </p>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="flex items-center justify-between pt-2 border-t text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Updated {formatDate(budget.updatedAt)}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                            ID: {budget.id}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Modals */}
            {canManage && (
                <>
                    <EditBudgetModal
                        isOpen={isEditModalOpen}
                        onClose={() => setIsEditModalOpen(false)}
                        budget={budget}
                        onSave={handleEditBudget}
                        isLoading={updateBudgetMutation.isPending}
                    />

                    <ExpenseModal
                        isOpen={isExpenseModalOpen}
                        onClose={() => setIsExpenseModalOpen(false)}
                        budget={budget}
                        expenseType={expenseType}
                        amount={expenseAmount}
                        onAmountChange={setExpenseAmount}
                        onSave={handleExpenseAction}
                        isLoading={addExpenseMutation.isPending || removeExpenseMutation.isPending}
                    />

                    <DeleteBudgetModal
                        isOpen={isDeleteModalOpen}
                        onClose={() => setIsDeleteModalOpen(false)}
                        budget={budget}
                        onConfirm={handleDeleteBudget}
                        isLoading={deleteBudgetMutation.isPending}
                    />
                </>
            )}
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

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = "Budget name is required";
        }

        const amount = parseFloat(formData.totalAmount);
        if (isNaN(amount) || amount <= 0) {
            newErrors.totalAmount = "Total amount must be greater than 0";
        } else if (amount < budget.spentAmount) {
            newErrors.totalAmount = `Total amount cannot be less than spent amount (${formatCurrency(budget.spentAmount)})`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        onSave({
            name: formData.name.trim(),
            description: formData.description.trim(),
            totalAmount: parseFloat(formData.totalAmount),
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Budget</DialogTitle>
                    <DialogDescription>
                        Update the details for this budget category.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-name">Budget Name *</Label>
                        <Input
                            id="edit-name"
                            value={formData.name}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, name: e.target.value }));
                                if (errors.name) setErrors(prev => ({ ...prev, name: "" }));
                            }}
                            className={errors.name ? "border-red-500" : ""}
                        />
                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-description">Description</Label>
                        <Textarea
                            id="edit-description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            rows={3}
                            maxLength={500}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-total">Total Amount *</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                            <Input
                                id="edit-total"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.totalAmount}
                                onChange={(e) => {
                                    setFormData(prev => ({ ...prev, totalAmount: e.target.value }));
                                    if (errors.totalAmount) setErrors(prev => ({ ...prev, totalAmount: "" }));
                                }}
                                className={`pl-8 ${errors.totalAmount ? "border-red-500" : ""}`}
                            />
                        </div>
                        {errors.totalAmount && <p className="text-sm text-red-500">{errors.totalAmount}</p>}
                        <p className="text-xs text-gray-500">
                            Current spent: {formatCurrency(budget.spentAmount)}
                        </p>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="green" disabled={isLoading}>
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

    const maxAmount = expenseType === "add"
        ? budget.remainingAmount
        : budget.spentAmount;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {expenseType === "add" ? "Add Expense" : "Remove Expense"}
                    </DialogTitle>
                    <DialogDescription>
                        {expenseType === "add"
                            ? `Record a new expense for "${budget.name}"`
                            : `Remove a previously recorded expense from "${budget.name}"`
                        }
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="expense-amount">Amount *</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                            <Input
                                id="expense-amount"
                                type="number"
                                step="0.01"
                                min="0"
                                max={maxAmount}
                                value={amount}
                                onChange={(e) => onAmountChange(e.target.value)}
                                placeholder="0.00"
                                className="pl-8"
                                required
                            />
                        </div>
                        <p className="text-xs text-gray-500">
                            {expenseType === "add"
                                ? `Available: ${formatCurrency(budget.remainingAmount)}`
                                : `Spent: ${formatCurrency(budget.spentAmount)}`
                            }
                        </p>
                    </div>

                    {/* Preview */}
                    {amount && parseFloat(amount) > 0 && (
                        <div className="p-3 bg-gray-50 rounded-lg space-y-1">
                            <p className="text-sm font-medium text-gray-700">Preview</p>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Current Spent:</span>
                                    <span>{formatCurrency(budget.spentAmount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        {expenseType === "add" ? "Adding:" : "Removing:"}
                                    </span>
                                    <span className={expenseType === "add" ? "text-red-600" : "text-green-600"}>
                                        {expenseType === "add" ? "+" : "-"}{formatCurrency(parseFloat(amount))}
                                    </span>
                                </div>
                                <div className="flex justify-between pt-1 border-t">
                                    <span className="font-medium">New Spent:</span>
                                    <span className="font-semibold">
                                        {formatCurrency(
                                            expenseType === "add"
                                                ? budget.spentAmount + parseFloat(amount)
                                                : budget.spentAmount - parseFloat(amount)
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

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
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Budget</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete <strong>&quot;{budget.name}&quot;</strong>? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                        <strong>Warning:</strong> Deleting this budget will remove all associated expense records and cannot be recovered.
                    </p>
                </div>

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
