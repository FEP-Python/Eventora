// 'use client';

// import axios from "axios";
// import { toast } from "sonner";
// import { useRouter } from "next/navigation";
// import { useMutation, useQueryClient } from "@tanstack/react-query";

// interface LoginData {
//   email: string;
//   password: string;
// }

// interface RegisterData {
//     firstName: string;
//     lastName: string;
//     email: string;
//     password: string;
// }

// const Login = async (credentials: LoginData) => {
//     try {
//         const res = await axios.post('/api/auth/login', credentials);
//         return res.data;
//     } catch (error) {
//         console.log("Error login the user: ", error);
//     }
// }

// const Register = async (credentials: RegisterData) => {
//     try {
//         const res = await axios.post('/api/auth/register', credentials);
//         return res.data;
//     } catch (error) {
//         console.log("Error registering the user: ", error);
//     }
// }

// export const useLogin = () => {
//     const queryClient = useQueryClient();

//     return useMutation({
//         mutationFn: (credentials: LoginData) => Login(credentials),
//         onSuccess: (data) => {
//             queryClient.setQueryData(["currentUser"], data.user);
//             localStorage.setItem("user", JSON.stringify(data.user));
//             localStorage.setItem("token", data.token);
//             toast.success(data.message);
//         },
//         onError: (data) => {
//             toast.error(data.message);
//         }
//     })
// }

// export const useRegister = () => {
//     return useMutation({
//         mutationFn: (credentials: RegisterData) => Register(credentials),
//         onSuccess: () => {
//             toast.success('Account created successfully!');
//         },
//         onError: (data) => {
//             toast.error(data.message);
//         }
//     })
// }


import axios from 'axios';
import { User } from '@/type';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useOrgStore } from './use-org-store';
import { useUserAllOrgs } from './use-users-org';
import { toast } from 'sonner';

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
    'http://localhost:5000/api/auth/login',
    credentials
  );
  return response.data;
};

const registerUser = async (userData: RegisterRequest): Promise<RegisterResponse> => {
  const response = await axios.post<RegisterResponse>(
    'http://localhost:5000/api/auth/register',
    userData
  );
  return response.data;
};

const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userString = localStorage.getItem('user');
  return userString ? JSON.parse(userString) : null;
};

const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

// Custom hooks
export const useLogin = () => {
    const router = useRouter();
    const { data: orgs=[], hasOrganizations } = useUserAllOrgs();
    const { activeOrg, setActiveOrg } = useOrgStore();
    const queryClient = useQueryClient();

    if(hasOrganizations && orgs.length !== 0) {
        setActiveOrg(orgs[0]);
    }

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      queryClient.invalidateQueries({ queryKey: ['auth'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });

      toast.success(data.message || 'Login successful!');
      router.push(activeOrg ? `/orgs/${activeOrg.id}` : '/create-org');
    },
    onError: (error) => {
      console.error('Login error:', error);

      // Handle different error response structures
      let errorMessage = 'Login failed. Please try again.';

      if(axios.isAxiosError(error)) {
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
      toast.success('Account created successfully!');
      router.push('/sign-in');
    },
    onError: (error) => {
      console.error('Registration error:', error);
    },
  });
};

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      queryClient.clear();

      return Promise.resolve();
    },
    onSuccess: () => {
      router.push('/sign-in');
    },
  });
};

// Hook to get current user from localStorage
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['auth', 'current-user'],
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
    queryKey: ['auth', 'token'],
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
      router.push('/sign-in');
      return false;
    }
    return true;
  };

  return { isAuthenticated, checkAuth };
};
