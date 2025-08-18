'use client';

import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface LoginData {
  email: string;
  password: string;
}

const Login = async (credentials: LoginData) => {
    try {
        const res = await axios.post('/api/auth/login', credentials);
        return res.data;
    } catch (error) {
        console.log("Error login the user: ", error);
    }
}

export const useLogin = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (credentials: LoginData) => Login(credentials),
        onSuccess: (data) => {
            queryClient.setQueryData(["currentUser"], data.user);
            localStorage.setItem("user", JSON.stringify(data.user));
            toast.success(data.message);
            router.push('/dashboard');
        },
        onError: (data) => {
            toast.error(data.message);
        }
    })
}
