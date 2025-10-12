import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
    Budget, 
    BudgetAnalytics, 
    CreateBudgetRequest, 
    UpdateBudgetRequest, 
    ExpenseRequest 
} from "@/type";
import { useAuthToken } from "./use-auth";

const API_BASE_URL = "http://localhost:5000/api/budget";

// Helper function to get auth headers
const getAuthHeaders = (token: string | null) => {
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

// API functions
const createBudget = async (budgetData: CreateBudgetRequest, token: string | null) => {
    const response = await axios.post(
        `${API_BASE_URL}/create`,
        budgetData,
        getAuthHeaders(token)
    );
    return response.data;
};

const getAllBudgets = async (orgId: string, token: string | null) => {
    const response = await axios.get(
        `${API_BASE_URL}/get-all/${orgId}`,
        getAuthHeaders(token)
    );
    return response.data;
};

const getBudgetById = async (budgetId: string, token: string | null) => {
    const response = await axios.get(
        `${API_BASE_URL}/get/${budgetId}`,
        getAuthHeaders(token)
    );
    return response.data;
};

const updateBudget = async (
    budgetId: string, 
    budgetData: UpdateBudgetRequest, 
    token: string | null
) => {
    const response = await axios.patch(
        `${API_BASE_URL}/update/${budgetId}`,
        budgetData,
        getAuthHeaders(token)
    );
    return response.data;
};

const deleteBudget = async (budgetId: string, token: string | null) => {
    const response = await axios.delete(
        `${API_BASE_URL}/delete/${budgetId}`,
        getAuthHeaders(token)
    );
    return response.data;
};

const addExpense = async (
    budgetId: string, 
    expenseData: ExpenseRequest, 
    token: string | null
) => {
    const response = await axios.post(
        `${API_BASE_URL}/add-expense/${budgetId}`,
        expenseData,
        getAuthHeaders(token)
    );
    return response.data;
};

const removeExpense = async (
    budgetId: string, 
    expenseData: ExpenseRequest, 
    token: string | null
) => {
    const response = await axios.post(
        `${API_BASE_URL}/remove-expense/${budgetId}`,
        expenseData,
        getAuthHeaders(token)
    );
    return response.data;
};

const getBudgetAnalytics = async (orgId: string, token: string | null) => {
    const response = await axios.get(
        `${API_BASE_URL}/analytics/${orgId}`,
        getAuthHeaders(token)
    );
    return response.data;
};

// Custom hooks
export const useCreateBudget = () => {
    const queryClient = useQueryClient();
    const { data: token } = useAuthToken();

    return useMutation({
        mutationFn: (budgetData: CreateBudgetRequest) => createBudget(budgetData, token),
        onSuccess: (data) => {
            toast.success(data.message || "Budget created successfully!");
            queryClient.invalidateQueries({ queryKey: ["budgets"] });
            queryClient.invalidateQueries({ queryKey: ["budget-analytics"] });
        },
        onError: (error: any) => {
            console.error("Create budget error:", error);
            const errorMessage = error?.response?.data?.message || "Failed to create budget";
            toast.error(errorMessage);
        },
    });
};

export const useGetAllBudgets = (orgId: string) => {
    const { data: token } = useAuthToken();

    return useQuery({
        queryKey: ["budgets", orgId],
        queryFn: () => getAllBudgets(orgId, token),
        enabled: !!orgId && !!token,
        select: (data) => {
            const budgets = data.data as Budget[];
            // Ensure dates are properly formatted strings
            return budgets.map(budget => ({
                ...budget,
                createdAt: budget.createdAt || new Date().toISOString(),
                updatedAt: budget.updatedAt || new Date().toISOString(),
            }));
        },
    });
};

export const useGetBudgetById = (budgetId: string) => {
    const { data: token } = useAuthToken();

    return useQuery({
        queryKey: ["budget", budgetId],
        queryFn: () => getBudgetById(budgetId, token),
        enabled: !!budgetId && !!token,
        select: (data) => {
            const budget = data.data as Budget;
            return {
                ...budget,
                createdAt: budget.createdAt || new Date().toISOString(),
                updatedAt: budget.updatedAt || new Date().toISOString(),
            };
        },
    });
};

export const useUpdateBudget = () => {
    const queryClient = useQueryClient();
    const { data: token } = useAuthToken();

    return useMutation({
        mutationFn: ({ 
            budgetId, 
            budgetData 
        }: { 
            budgetId: string; 
            budgetData: UpdateBudgetRequest 
        }) => updateBudget(budgetId, budgetData, token),
        onSuccess: (data) => {
            toast.success(data.message || "Budget updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["budgets"] });
            queryClient.invalidateQueries({ queryKey: ["budget-analytics"] });
        },
        onError: (error: any) => {
            console.error("Update budget error:", error);
            const errorMessage = error?.response?.data?.message || "Failed to update budget";
            toast.error(errorMessage);
        },
    });
};

export const useDeleteBudget = () => {
    const queryClient = useQueryClient();
    const { data: token } = useAuthToken();

    return useMutation({
        mutationFn: (budgetId: string) => deleteBudget(budgetId, token),
        onSuccess: (data) => {
            toast.success(data.message || "Budget deleted successfully!");
            queryClient.invalidateQueries({ queryKey: ["budgets"] });
            queryClient.invalidateQueries({ queryKey: ["budget-analytics"] });
        },
        onError: (error: any) => {
            console.error("Delete budget error:", error);
            const errorMessage = error?.response?.data?.message || "Failed to delete budget";
            toast.error(errorMessage);
        },
    });
};

export const useAddExpense = () => {
    const queryClient = useQueryClient();
    const { data: token } = useAuthToken();

    return useMutation({
        mutationFn: ({ 
            budgetId, 
            expenseData 
        }: { 
            budgetId: string; 
            expenseData: ExpenseRequest 
        }) => addExpense(budgetId, expenseData, token),
        onSuccess: (data) => {
            toast.success(data.message || "Expense added successfully!");
            queryClient.invalidateQueries({ queryKey: ["budgets"] });
            queryClient.invalidateQueries({ queryKey: ["budget-analytics"] });
        },
        onError: (error: any) => {
            console.error("Add expense error:", error);
            const errorMessage = error?.response?.data?.message || "Failed to add expense";
            toast.error(errorMessage);
        },
    });
};

export const useRemoveExpense = () => {
    const queryClient = useQueryClient();
    const { data: token } = useAuthToken();

    return useMutation({
        mutationFn: ({ 
            budgetId, 
            expenseData 
        }: { 
            budgetId: string; 
            expenseData: ExpenseRequest 
        }) => removeExpense(budgetId, expenseData, token),
        onSuccess: (data) => {
            toast.success(data.message || "Expense removed successfully!");
            queryClient.invalidateQueries({ queryKey: ["budgets"] });
            queryClient.invalidateQueries({ queryKey: ["budget-analytics"] });
        },
        onError: (error: any) => {
            console.error("Remove expense error:", error);
            const errorMessage = error?.response?.data?.message || "Failed to remove expense";
            toast.error(errorMessage);
        },
    });
};

export const useGetBudgetAnalytics = (orgId: string) => {
    const { data: token } = useAuthToken();

    return useQuery({
        queryKey: ["budget-analytics", orgId],
        queryFn: () => getBudgetAnalytics(orgId, token),
        enabled: !!orgId && !!token,
        select: (data) => {
            const analytics = data.data as BudgetAnalytics;
            return {
                ...analytics,
                budgets: analytics.budgets.map(budget => ({
                    ...budget,
                    createdAt: budget.createdAt || new Date().toISOString(),
                    updatedAt: budget.updatedAt || new Date().toISOString(),
                })),
            };
        },
    });
};
