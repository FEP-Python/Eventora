'use client';

import axios from "axios";
import { Org, User } from "@/type";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useOrgStore } from "./use-org-store";
import {
  getUserMemberOrgs,
  getUserOwnedOrgs,
} from "./use-users-org";
import { toast } from "sonner";
import { backend_api_url } from "@/constants";

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: string;
}

interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

interface RegisterResponse {
  message: string;
}

// API functions
const loginUser = async (credentials: LoginRequest): Promise<AuthResponse> => {
  const response = await axios.post<AuthResponse>(
    `${backend_api_url}/auth/login`,
    credentials
  );
  return response.data;
};

const registerUser = async (
  userData: RegisterRequest
): Promise<RegisterResponse> => {
  const response = await axios.post<RegisterResponse>(
    `${backend_api_url}/auth/register`,
    userData
  );
  return response.data;
};

const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null;
  const userString = localStorage.getItem("user");
  return userString ? JSON.parse(userString) : null;
};

const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

export const getUserById = async (id: string) => {
  if (typeof window === "undefined") return null;
  const response = await axios.get(`${backend_api_url}/user/get/${id}`);
  return response.data;
};

// Custom hooks
export const useLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setActiveOrg } = useOrgStore();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: async (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      queryClient.invalidateQueries({ queryKey: ["auth"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });

      toast.success(data.message || "Login successful!");

      try {
        const [ownedOrgs, memberOrgs] = await Promise.all([
          getUserOwnedOrgs(),
          getUserMemberOrgs(),
        ]);

        const allOrgs = [...ownedOrgs, ...memberOrgs].reduce((acc, org: Org) => {
          if (!acc.find((existingOrg: Org) => existingOrg.id === org.id)) {
            acc.push(org);
          }
          return acc;
        }, []);

        if (allOrgs.length > 0) {
          setActiveOrg(allOrgs[0]);
          router.push(`/orgs/${allOrgs[0].id}`);
        } else {
          router.push("/create-org");
        }

        queryClient.invalidateQueries({ queryKey: ["user", "owned-orgs"] });
        queryClient.invalidateQueries({ queryKey: ["user", "member-orgs"] });
      } catch (error) {
        console.log(error);
        router.push('/create-org');
      }
    },
    onError: (error) => {
      console.error("Login error:", error);

      // Handle different error response structures
      let errorMessage = "Login failed. Please try again.";

      if (axios.isAxiosError(error)) {
        if (error?.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error?.message) {
          errorMessage = error.message;
        }
      }

      toast.error(errorMessage);
    },
  });
};

export const useRegister = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      toast.success("Account created successfully!");
      router.push("/sign-in");
    },
    onError: (error) => {
      console.error("Registration error:", error);
    },
  });
};

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      queryClient.clear();

      return Promise.resolve();
    },
    onSuccess: () => {
      router.push("/sign-in");
    },
  });
};

// Hook to get current user from localStorage
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["auth", "current-user"],
    queryFn: getCurrentUser,
    staleTime: Infinity,
  });
};

// Hook to check authentication status
export const useIsAuthenticated = () => {
  const { data: user } = useCurrentUser();
  const token = getAuthToken();

  return {
    isAuthenticated: !!token,
    user,
    token,
  };
};

// Hook to get auth token
export const useAuthToken = () => {
  return useQuery({
    queryKey: ["auth", "token"],
    queryFn: getAuthToken,
    staleTime: Infinity,
  });
};

// Protected route hook - redirects if not authenticated
export const useAuthGuard = () => {
  const router = useRouter();
  const { isAuthenticated } = useIsAuthenticated();

  const checkAuth = () => {
    if (!isAuthenticated) {
      router.push("/sign-in");
      return false;
    }
    return true;
  };

  return { isAuthenticated, checkAuth };
};
