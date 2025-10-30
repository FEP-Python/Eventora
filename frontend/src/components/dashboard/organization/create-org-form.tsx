"use client"

import z from "zod"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { Building2, GraduationCap, Mail, Phone, Globe, MessageSquare, ArrowLeft } from "lucide-react"

import { useCreateOrg } from "@/hooks/use-org"
import { zodResolver } from "@hookform/resolvers/zod"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { CardContent, CardFooter } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"


const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    college: z.string().min(1, "College name is required"),
    description: z.string().optional(),
    contactPhone: z.string().min(1, "Phone number is required"),
    contactEmail: z.string().min(1, "Contact email is required"),
    website: z.string().optional(),
});

export function CreateOrgForm() {
    const router = useRouter();
    const createOrgMutation = useCreateOrg();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            college: "",
            description: "",
            contactPhone: "",
            contactEmail: "",
            website: ""
        }
    });

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        try {
            createOrgMutation.mutate(values);
        } catch (error) {
            console.log('Error creating club: ', error);
        }
    }

    return (
        <div className="bg-white shadow-xl border-0 rounded-lg">
            {/* Register Your Club Heading */}
            <div className="bg-[#588157] text-white rounded-t-lg p-8 flex items-center relative">
                <div className="flex items-center gap-1 absolute left-4">
                    <ArrowLeft className="h-4 w-4" />
                    <h2 className="text-lg cursor-pointer" onClick={() => router.back()}>
                        Back
                    </h2>
                </div>
                <h2 className="text-2xl font-semibold flex items-center justify-center text-center w-full gap-2">
                    <Building2 className="h-6 w-6" />
                    Register Your Club
                </h2>
            </div>
            <CardContent className="p-8">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        {/* Organization Name */}
                        <FormField
                            name="name"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[#344E41] font-medium flex items-center gap-2">
                                        <Building2 className="h-4 w-4" />
                                        Club Name *
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="text"
                                            placeholder="Enter your club name"
                                            className="border-[#A3B18A] focus:border-[#588157] focus:ring-[#588157] bg-[#DAD7CD]/20"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* College Name */}
                        <FormField
                            name="college"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[#344E41] font-medium flex items-center gap-2">
                                        <GraduationCap className="h-4 w-4" />
                                        College/Institution Name *
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="text"
                                            placeholder="Enter college name"
                                            className="border-[#A3B18A] focus:border-[#588157] focus:ring-[#588157] bg-[#DAD7CD]/20"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* Description */}
                        <FormField
                            name="description"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[#344E41] font-medium flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4" />
                                        Description
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder="Describe your club, its mission, and activities"
                                            rows={4}
                                            className="border-[#A3B18A] focus:border-[#588157] focus:ring-[#588157] bg-[#DAD7CD]/20 resize-none"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* Contact Information Grid */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Contact Number */}
                            <FormField
                                name="contactPhone"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[#344E41] font-medium flex items-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            Contact Number *
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="tel"
                                                placeholder="+91 1234567890"
                                                className="border-[#A3B18A] focus:border-[#588157] focus:ring-[#588157] bg-[#DAD7CD]/20"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* Contact Email */}
                            <FormField
                                name="contactEmail"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[#344E41] font-medium flex items-center gap-2">
                                            <Mail className="h-4 w-4" />
                                            Email Address *
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="email"
                                                placeholder="club@example.com"
                                                className="border-[#A3B18A] focus:border-[#588157] focus:ring-[#588157] bg-[#DAD7CD]/20"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        {/* Website URL */}
                        <FormField
                            name="website"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[#344E41] font-medium flex items-center gap-2">
                                        <Globe className="h-4 w-4" />
                                        Website URL
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="url"
                                            placeholder="https://www.yourclub.com"
                                            className="border-[#A3B18A] focus:border-[#588157] focus:ring-[#588157] bg-[#DAD7CD]/20"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* Submit Button */}
                        <div className="pt-4">
                            <Button
                                type="submit"
                                disabled={createOrgMutation.isPending}
                                className="w-full bg-[#3A5A40] hover:bg-[#344E41] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50"
                            >
                                {createOrgMutation.isPending ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Registering...
                                    </div>
                                ) : (
                                    "Register Club"
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="pb-5 text-center flex items-center justify-center">
                Have a code? {" "}
                <Link href='/join-club' className="underline text-[#3A5A40] ml-1">
                    Join Club
                </Link>
            </CardFooter>
        </div>
    )
}
