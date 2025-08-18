'use client';

import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

interface RegisterData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

const Register = async (credentials: RegisterData) => {
    try {
        const res = await axios.post('/api/auth/register', credentials);
        return res.data;
    } catch (error) {
        console.log("Error registering the user: ", error);
    }
}

export const useRegister = () => {
    const router = useRouter();

    return useMutation({
        mutationFn: (credentials: RegisterData) => Register(credentials),
        onSuccess: () => {
            toast.success('Account created successfully!');
            router.push('/sign-in');
        },
        onError: (data) => {
            toast.error(data.message);
        }
    })
}
