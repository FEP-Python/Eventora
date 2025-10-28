'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useCreateBudget } from "@/hooks/use-budget";
import { useOrgId } from "@/hooks/use-org-id";

interface CreateBudgetModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateBudgetModal = ({ isOpen, onClose }: CreateBudgetModalProps) => {
    const orgId = useOrgId();
    const createBudgetMutation = useCreateBudget();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        totalAmount: "",
        spentAmount: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = "Budget name is required";
        } else if (formData.name.trim().length < 3) {
            newErrors.name = "Budget name must be at least 3 characters";
        }

        if (!formData.totalAmount) {
            newErrors.totalAmount = "Total amount is required";
        } else {
            const amount = parseFloat(formData.totalAmount);
            if (isNaN(amount) || amount <= 0) {
                newErrors.totalAmount = "Total amount must be greater than 0";
            }
        }

        if (formData.spentAmount) {
            const spentAmount = parseFloat(formData.spentAmount);
            const totalAmount = parseFloat(formData.totalAmount);

            if (isNaN(spentAmount) || spentAmount < 0) {
                newErrors.spentAmount = "Spent amount must be 0 or greater";
            } else if (spentAmount > totalAmount) {
                newErrors.spentAmount = "Spent amount cannot exceed total amount";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            await createBudgetMutation.mutateAsync({
                orgId: parseInt(orgId),
                name: formData.name.trim(),
                description: formData.description.trim() || undefined,
                totalAmount: parseFloat(formData.totalAmount),
                spentAmount: formData.spentAmount ? parseFloat(formData.spentAmount) : 0,
            });

            // Reset form and close modal on success
            handleClose();
        } catch (error) {
            // Error is handled by the mutation's onError
            console.error("Failed to create budget:", error);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleClose = () => {
        // Reset form
        setFormData({
            name: "",
            description: "",
            totalAmount: "",
            spentAmount: "",
        });
        setErrors({});
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create New Budget</DialogTitle>
                    <DialogDescription>
                        Create a budget category to track and manage expenses for your organization.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Budget Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">
                            Budget Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            placeholder="e.g., Event Expenses, Marketing, Venue Booking"
                            className={errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
                            maxLength={100}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium">
                            Description
                        </Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleInputChange("description", e.target.value)}
                            placeholder="Optional: Add details about this budget category..."
                            rows={3}
                            maxLength={500}
                            className="resize-none"
                        />
                        <p className="text-xs text-gray-500">
                            {formData.description.length}/500 characters
                        </p>
                    </div>

                    {/* Total Amount */}
                    <div className="space-y-2">
                        <Label htmlFor="totalAmount" className="text-sm font-medium">
                            Total Budget Amount <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                            <Input
                                id="totalAmount"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.totalAmount}
                                onChange={(e) => handleInputChange("totalAmount", e.target.value)}
                                placeholder="0.00"
                                className={`pl-8 ${errors.totalAmount ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                            />
                        </div>
                        {errors.totalAmount && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                                {errors.totalAmount}
                            </p>
                        )}
                        <p className="text-xs text-gray-500">
                            Enter the total allocated budget for this category
                        </p>
                    </div>

                    {/* Spent Amount */}
                    <div className="space-y-2">
                        <Label htmlFor="spentAmount" className="text-sm font-medium">
                            Initial Spent Amount (Optional)
                        </Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                            <Input
                                id="spentAmount"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.spentAmount}
                                onChange={(e) => handleInputChange("spentAmount", e.target.value)}
                                placeholder="0.00"
                                className={`pl-8 ${errors.spentAmount ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                            />
                        </div>
                        {errors.spentAmount && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                                {errors.spentAmount}
                            </p>
                        )}
                        <p className="text-xs text-gray-500">
                            Leave empty if no amount has been spent yet
                        </p>
                    </div>

                    {/* Summary */}
                    {formData.totalAmount && (
                        <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                            <p className="text-sm font-medium text-gray-700">Summary</p>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Budget:</span>
                                    <span className="font-medium">₹{parseFloat(formData.totalAmount || "0").toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Initial Spent:</span>
                                    <span className="font-medium">₹{parseFloat(formData.spentAmount || "0").toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between pt-1 border-t">
                                    <span className="text-gray-900 font-medium">Remaining:</span>
                                    <span className="font-semibold text-green-600">
                                        ₹{(parseFloat(formData.totalAmount || "0") - parseFloat(formData.spentAmount || "0")).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={createBudgetMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="green"
                            disabled={createBudgetMutation.isPending}
                            className="min-w-[100px]"
                        >
                            {createBudgetMutation.isPending ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                    Creating...
                                </>
                            ) : (
                                "Create Budget"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
