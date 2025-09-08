"use client";

import * as z from "zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "@/hooks/use-auth";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormItem, FormControl, FormField, FormMessage, FormLabel } from "@/components/ui/form";


const formSchema = z.object({
    email: z.email(),
    password: z.string().min(1, "Password is required"),
});

export const SignInForm = () => {
    const [showPassword, setShowPassword] = useState(false);

    const login = useLogin();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        }
    });

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            login.mutate(values);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <Card className="bg-white/95 backdrop-blur-sm border-[#A3B18A]/20 shadow-xl">
            <CardHeader className="pb-6">
                <CardTitle className="text-3xl font-bold text-[#344E41] text-center">Welcome Back</CardTitle>
                <CardDescription className="text-center text-[#3A5A40]">
                    Sign in to your account to continue
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        <FormField
                            name="email"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[#344E41] font-medium">Email Address</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#588157]" />
                                            <Input
                                                {...field}
                                                type="email"
                                                placeholder="john@college.edu"
                                                className="pl-10 border-[#A3B18A]/30 focus:border-[#588157]"
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="password"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[#344E41] font-medium">Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#588157]" />
                                            <Input
                                                {...field}
                                                type={showPassword ? "text" : "password"}
                                                value={field.value}
                                                placeholder="Enter your password"
                                                onChange={(e) => field.onChange(e.target.value)}
                                                className="pl-10 border-[#A3B18A]/30 focus:border-[#588157]"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#588157] hover:text-[#3A5A40]"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button
                            type="submit"
                            className="w-full bg-[#3A5A40] hover:bg-[#344E41] text-white"
                            disabled={login.isPending}
                        >
                            {login.isPending ? (
                                <div className="flex items-center space-x-2">
                                    <Loader2 className="animate-spin h-4 w-4" />
                                    <span>Signing in...</span>
                                </div>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>
                </Form>

                <div className="text-center pt-4 border-t border-[#A3B18A]/20">
                    <p className="text-[#3A5A40]">
                        Don&apos;t have an account?{" "}
                        <Link href="/sign-up" className="text-[#588157] hover:text-[#3A5A40] font-medium">
                            Sign up
                        </Link>
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
