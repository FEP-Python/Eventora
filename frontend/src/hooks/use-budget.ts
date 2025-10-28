/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Budget,
  CreateBudgetRequest,
  UpdateBudgetRequest,
  BudgetAnalytics,
  ExpenseRequest,
} from "@/type";
import { backend_api_url } from "@/constants";

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  return {
    Authorization: `Bearer ${token}`,
  };
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

// Create Budget
const createBudget = async (budgetData: CreateBudgetRequest) => {
  const response = await axios.post(
    `${backend_api_url}/budget/create`,
    budgetData,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

// Get All Budgets by Organization
const getAllBudgets = async (orgId: number): Promise<Budget[]> => {
  const response = await axios.get(
    `${backend_api_url}/budget/get-all/${orgId}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data.data;
};

// Get Budget by ID
const getBudgetById = async (budgetId: number): Promise<Budget> => {
  const response = await axios.get(
    `${backend_api_url}/budget/get/${budgetId}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data.data;
};

// Update Budget
const updateBudget = async (
  budgetId: number,
  budgetData: UpdateBudgetRequest
) => {
  const response = await axios.patch(
    `${backend_api_url}/budget/update/${budgetId}`,
    budgetData,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

// Delete Budget
const deleteBudget = async (budgetId: number) => {
  const response = await axios.delete(
    `${backend_api_url}/budget/delete/${budgetId}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

// Add Expense
const addExpense = async (budgetId: number, expenseData: ExpenseRequest) => {
  const response = await axios.post(
    `${backend_api_url}/budget/add-expense/${budgetId}`,
    expenseData,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

// Remove Expense
const removeExpense = async (budgetId: number, expenseData: ExpenseRequest) => {
  const response = await axios.post(
    `${backend_api_url}/budget/remove-expense/${budgetId}`,
    expenseData,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

// Get Budget Analytics
const getBudgetAnalytics = async (orgId: number): Promise<BudgetAnalytics> => {
  const response = await axios.get(
    `${backend_api_url}/budget/analytics/${orgId}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data.data;
};

// ============================================================================
// MUTATION HOOKS
// ============================================================================

export const useCreateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBudget,
    onSuccess: (data, variables) => {
      toast.success(data.message || "Budget created successfully!");

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["budgets", variables.orgId] });
      queryClient.invalidateQueries({
        queryKey: ["budget-analytics", variables.orgId],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard", variables.orgId],
      });
      queryClient.invalidateQueries({
        queryKey: ["org-details", variables.orgId],
      });
    },
    onError: (error: any) => {
      console.error("Create budget error:", error);
      const errorMessage =
        error?.response?.data?.message || "Failed to create budget";
      toast.error(errorMessage);
    },
  });
};

export const useUpdateBudget = (budgetId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (budgetData: UpdateBudgetRequest) =>
      updateBudget(budgetId, budgetData),
    onSuccess: (data) => {
      toast.success(data.message || "Budget updated successfully!");

      // Update the specific budget in cache
      if (data?.data?.id) {
        queryClient.setQueryData(["budget", data.data.id], data.data);
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["budget", budgetId] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["budget-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error: any) => {
      console.error("Update budget error:", error);
      const errorMessage =
        error?.response?.data?.message || "Failed to update budget";
      toast.error(errorMessage);
    },
  });
};

export const useDeleteBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBudget,
    onSuccess: (data, deletedId) => {
      toast.success(data.message || "Budget deleted successfully!");

      // Remove from cache
      queryClient.removeQueries({ queryKey: ["budget", deletedId] });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["budget-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["org-details"] });
    },
    onError: (error: any) => {
      console.error("Delete budget error:", error);
      const errorMessage =
        error?.response?.data?.message || "Failed to delete budget";
      toast.error(errorMessage);
    },
  });
};

export const useAddExpense = (budgetId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (expenseData: ExpenseRequest) =>
      addExpense(budgetId, expenseData),
    onSuccess: (data) => {
      toast.success(data.message || "Expense added successfully!");

      // Update the specific budget in cache
      if (data?.data?.id) {
        queryClient.setQueryData(["budget", data.data.id], data.data);
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["budget", budgetId] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["budget-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error: any) => {
      console.error("Add expense error:", error);
      const errorMessage =
        error?.response?.data?.message || "Failed to add expense";
      toast.error(errorMessage);
    },
  });
};

export const useRemoveExpense = (budgetId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (expenseData: ExpenseRequest) =>
      removeExpense(budgetId, expenseData),
    onSuccess: (data) => {
      toast.success(data.message || "Expense removed successfully!");

      // Update the specific budget in cache
      if (data?.data?.id) {
        queryClient.setQueryData(["budget", data.data.id], data.data);
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["budget", budgetId] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["budget-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error: any) => {
      console.error("Remove expense error:", error);
      const errorMessage =
        error?.response?.data?.message || "Failed to remove expense";
      toast.error(errorMessage);
    },
  });
};

// ============================================================================
// QUERY HOOKS
// ============================================================================

export const useGetAllBudgets = (orgId: number) => {
  return useQuery({
    queryKey: ["budgets", orgId],
    queryFn: () => getAllBudgets(orgId),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGetBudgetById = (budgetId: number) => {
  return useQuery({
    queryKey: ["budget", budgetId],
    queryFn: () => getBudgetById(budgetId),
    enabled: !!budgetId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGetBudgetAnalytics = (orgId: number) => {
  return useQuery({
    queryKey: ["budget-analytics", orgId],
    queryFn: () => getBudgetAnalytics(orgId),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// ============================================================================
// UTILITY HOOKS
// ============================================================================

export const useBudgetActions = (budgetId: number) => {
  const updateMutation = useUpdateBudget(budgetId);
  const deleteMutation = useDeleteBudget();
  const addExpenseMutation = useAddExpense(budgetId);
  const removeExpenseMutation = useRemoveExpense(budgetId);
  const { data: budget, isLoading, error } = useGetBudgetById(budgetId);

  const updateBudget = (budgetData: UpdateBudgetRequest) => {
    updateMutation.mutate(budgetData);
  };

  const deleteBudget = () => {
    deleteMutation.mutate(budgetId);
  };

  const addExpense = (amount: number) => {
    addExpenseMutation.mutate({ amount });
  };

  const removeExpense = (amount: number) => {
    removeExpenseMutation.mutate({ amount });
  };

  return {
    budget,
    isLoading,
    error,
    updateBudget,
    deleteBudget,
    addExpense,
    removeExpense,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isAddingExpense: addExpenseMutation.isPending,
    isRemovingExpense: removeExpenseMutation.isPending,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
    addExpenseError: addExpenseMutation.error,
    removeExpenseError: removeExpenseMutation.error,
  };
};

// Combined hook for organization budget management
export const useOrgBudgetManagement = (orgId: number) => {
  const createMutation = useCreateBudget();
  const { data: budgets, isLoading, error, refetch } = useGetAllBudgets(orgId);
  const { data: analytics } = useGetBudgetAnalytics(orgId);

  const createBudget = (budgetData: Omit<CreateBudgetRequest, "orgId">) => {
    createMutation.mutate({ ...budgetData, orgId });
  };

  return {
    budgets,
    analytics,
    isLoading,
    error,
    createBudget,
    isCreating: createMutation.isPending,
    createError: createMutation.error,
    refetchBudgets: refetch,
  };
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const canManageBudget = (userRole: string | null | undefined) => {
  return userRole === "leader" || userRole === "coleader";
};

export const calculateBudgetUtilization = (
  spent: number,
  total: number
): number => {
  if (total === 0) return 0;
  return (spent / total) * 100;
};

export const getBudgetStatus = (
  spent: number,
  total: number
): "healthy" | "warning" | "critical" => {
  const utilization = calculateBudgetUtilization(spent, total);

  if (utilization < 70) return "healthy";
  if (utilization < 90) return "warning";
  return "critical";
};

export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString("en-IN", {
    // minimumFractionDigits: 2,
    // maximumFractionDigits: 2,
  })}`;
};
