'use client';

import { useState, useEffect } from "react";
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
import { toast } from "sonner";

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

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = "Budget name is required";
        }

        if (!formData.totalAmount) {
            newErrors.totalAmount = "Total amount is required";
        } else {
            const amount = parseFloat(formData.totalAmount);
            if (isNaN(amount) || amount <= 0) {
                newErrors.totalAmount = "Total amount must be a positive number";
            }
        }

        if (formData.spentAmount) {
            const spentAmount = parseFloat(formData.spentAmount);
            const totalAmount = parseFloat(formData.totalAmount);
            
            if (isNaN(spentAmount) || spentAmount < 0) {
                newErrors.spentAmount = "Spent amount must be a non-negative number";
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

            // Reset form and close modal
            setFormData({
                name: "",
                description: "",
                totalAmount: "",
                spentAmount: "",
            });
            setErrors({});
            onClose();
        } catch (error) {
            // Error is handled by the mutation
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }
    };

    const handleClose = () => {
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
            <DialogContent className="sm:max-w-[425px]" onOpenAutoFocus={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Create New Budget</DialogTitle>
                    <DialogDescription>
                        Create a new budget category to track expenses for your club.
                    </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Budget Name *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            placeholder="e.g., Venue & Equipment"
                            className={errors.name ? "border-red-500" : ""}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500">{errors.name}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleInputChange("description", e.target.value)}
                            placeholder="Optional description for this budget category"
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="totalAmount">Total Amount *</Label>
                        <Input
                            id="totalAmount"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.totalAmount}
                            onChange={(e) => handleInputChange("totalAmount", e.target.value)}
                            placeholder="0.00"
                            className={errors.totalAmount ? "border-red-500" : ""}
                        />
                        {errors.totalAmount && (
                            <p className="text-sm text-red-500">{errors.totalAmount}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="spentAmount">Initial Spent Amount</Label>
                        <Input
                            id="spentAmount"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.spentAmount}
                            onChange={(e) => handleInputChange("spentAmount", e.target.value)}
                            placeholder="0.00"
                            className={errors.spentAmount ? "border-red-500" : ""}
                        />
                        {errors.spentAmount && (
                            <p className="text-sm text-red-500">{errors.spentAmount}</p>
                        )}
                        <p className="text-xs text-gray-500">
                            Leave empty to start with 0 spent amount
                        </p>
                    </div>

                    <DialogFooter>
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
                        >
                            {createBudgetMutation.isPending ? "Creating..." : "Create Budget"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
