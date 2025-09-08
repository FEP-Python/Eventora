"use client";

import * as z from "zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";


import { zodResolver } from "@hookform/resolvers/zod";
import { useIsAuthenticated, useRegister } from "@/hooks/use-auth";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormItem, FormControl, FormField, FormMessage, FormLabel } from "@/components/ui/form";
import { useOrgStore } from "@/hooks/use-org-store";


const formSchema = z.object({
    firstname: z.string().min(1, "First name is required"),
    lastname: z.string().min(1, "Last name is required"),
    email: z.email(),
    password: z.string().min(1, "Password is required"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
})
    .refine(data => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

const SignUpForm = () => {
    const router = useRouter();
    const { activeOrg } = useOrgStore();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const register = useRegister();
    const { isAuthenticated } = useIsAuthenticated();

    useEffect(() => {
        if (isAuthenticated) {
            router.push(`/orgs/${activeOrg?.id}`);
        }
    }, [isAuthenticated, router, activeOrg]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstname: "",
            lastname: "",
            email: "",
            password: "",
            confirmPassword: "",
        }
    });

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setIsLoading(true);
            register.mutate({
                firstName: values.firstname,
                lastName: values.lastname,
                email: values.email,
                password: values.password
            });
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isAuthenticated) {
        return <div>Redirecting to dashboard...</div>;
    }

    return (
        <Card className="bg-white/95 backdrop-blur-sm border-[#A3B18A]/20 shadow-xl">
            <CardHeader className="pb-6">
                <CardTitle className="text-3xl font-bold text-center text-[#344E41]">
                    Create Account
                </CardTitle>
                <CardDescription className="text-center text-[#3A5A40]">
                    Join and manage events using Eventora
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    name="firstname"
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[#344E41] font-medium">First Name</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#588157]" />
                                                    <Input
                                                        {...field}
                                                        type="text"
                                                        placeholder="John"
                                                        className="pl-10 border-[#A3B18A]/30 focus:border-[#588157]"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    name="lastname"
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[#344E41] font-medium">Last Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="text"
                                                    placeholder="Doe"
                                                    className="border-[#A3B18A]/30 focus:border-[#588157]"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
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
                                                    onClick={() => setShowPassword(prev => !prev)}
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
                            <FormField
                                name="confirmPassword"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[#344E41] font-medium">Confirm Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#588157]" />
                                                <Input
                                                    {...field}
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    value={field.value}
                                                    placeholder="Confirm your password"
                                                    onChange={(e) => field.onChange(e.target.value)}
                                                    className="pl-10 border-[#A3B18A]/30 focus:border-[#588157]"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(prev => !prev)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#588157] hover:text-[#3A5A40]"
                                                >
                                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <Button
                            type="submit"
                            className="flex-1 w-full bg-[#3A5A40] hover:bg-[#344E41] text-white"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center space-x-2">
                                    <Loader2 className="animate-spin h-4 w-4" />
                                    <span>Creating...</span>
                                </div>
                            ) : (
                                "Create Account"
                            )}
                        </Button>
                        <div className="text-center pt-4 border-t border-[#A3B18A]/20">
                            <p className="text-[#3A5A40]">
                                Already have an account?{" "}
                                <Link href="/sign-in" className="text-[#588157] hover:text-[#3A5A40] font-medium">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

export default SignUpForm;
