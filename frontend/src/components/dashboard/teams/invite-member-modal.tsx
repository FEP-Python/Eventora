"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";

import { useOrgStore } from "@/hooks/use-org-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useModalStore } from "@/hooks/use-modal-store";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useOrgTeamManagement, useTeamActions } from "@/hooks/use-team";


const formSchema = z.object({
    teamId: z.string().min(1, "Please select team"),
    email: z.string().email("Please enter a valid email address"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
});
type FormType = z.infer<typeof formSchema>;

export const InviteMemberModal = () => {
    const { activeOrg } = useOrgStore();
    const { isOpen, closeModal, type } = useModalStore();

    const isInviteModalOpen = isOpen && type === "inviteMember";

    const form = useForm<FormType>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            teamId: "",
            email: "",
            firstName: '',
            lastName: '',
        }
    });

    const handleSubmit = async (data: FormType) => {
        const requestData = {
            name: data.name,
            description: data.description || "",
            orgId: activeOrg?.id || 0,
        };

        try {
            await createTeam(requestData);
            closeModal();
            form.reset();
        } catch (error) {
            console.error("Error creating team:", error);
        }
    };

    return (
        <ResponsiveModal
            title="Create Team"
            open={isTeamModalOpen}
            onOpenChange={closeModal}
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
                    <FormField
                        name="name"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name *</FormLabel>
                                <FormControl>
                                    <Input placeholder="Design, Marketing etc." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        name="description"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Info about the team..."
                                        {...field}
                                        rows={3}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        variant="green"
                        disabled={isCreating}
                        className="w-full"
                    >
                        {isCreating ? "Creating..." : "Create Team"}
                    </Button>
                </form>
            </Form>
        </ResponsiveModal>
    );
}
