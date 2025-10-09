"use client";

import * as z from "zod";
import { format } from "date-fns";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEvent, useEventActions } from "@/hooks/use-event";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface EventEditFormProps {
    orgId: number;
    eventId: number;
}

const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    startDate: z.date("Start date is required"),
    endDate: z.date("Start date is required"),
    registrationDeadline: z.date().optional(),
    capacity: z.number().min(1, 'Capacity must be at least 1').optional(),
    location: z.string().min(1, "Location is required"),
    eventType: z.string().min(1, "Event type is required"),
    status: z.enum(["draft", "planned", "ongoing", "completed", "cancelled"], "Status is required"),
    isPublic: z.boolean(),
    registrationRequired: z.boolean(),
    entryFee: z.number().min(0, 'Entry fee cannot be negative'),
    certificateProvided: z.boolean(),
}).refine((data) => {
    return data.endDate >= data.startDate;
}, {
    message: "End date must be after start date",
    path: ["endDate"]
}).refine((data) => {
    // If registration deadline is provided, it should be before start date
    if (data.registrationDeadline) {
        return data.registrationDeadline <= data.startDate;
    }
    return true;
}, {
    message: "Registration deadline must be before start date",
    path: ["registrationDeadline"]
});

export const EventEditForm = ({ orgId, eventId }: EventEditFormProps) => {
    const router = useRouter();
    const { data, isLoading } = useEvent(eventId);
    const { updateEvent, isUpdating } = useEventActions(eventId);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: data
            ? {
                title: data.title,
                description: data.description,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                registrationDeadline: data.registrationDeadline
                    ? new Date(data.registrationDeadline)
                    : undefined,
                capacity: data.capacity || undefined,
                location: data.location || "",
                eventType: data.eventType,
                status: data.status,
                entryFee: data.entryFee || 0,
                isPublic: data.isPublic,
                registrationRequired: data.registrationRequired,
                certificateProvided: data.certificateProvided,
            }
            : {},
    });

    useEffect(() => {
        if (data) {
            form.reset({
                title: data.title || "",
                description: data.description || "",
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                registrationDeadline: data.registrationDeadline
                    ? new Date(data.registrationDeadline)
                    : undefined,
                capacity: data.capacity || undefined,
                location: data.location || "",
                eventType: data.eventType || "",
                status: data.status || "draft",
                entryFee: data.entryFee || 0,
                isPublic: data.isPublic ?? true,
                registrationRequired: data.registrationRequired ?? false,
                certificateProvided: data.certificateProvided ?? false,
            });
        }
    }, [data, form]);

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        const requestData = {
            ...values,
            startDate: values.startDate.toISOString(),
            endDate: values.endDate.toISOString(),
            registrationDeadline: values.registrationDeadline?.toISOString(),
        };

        try {
            updateEvent(requestData);
            router.push(`/orgs/${orgId}/events`);
        } catch (error) {
            console.error("Error updating event:", error);
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <div className="max-w-7xl mx-auto">
                {/* Back and Title */}
                <div className="mb-10 flex items-center gap-x-4">
                    <Button variant="outline" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-3xl font-bold">
                        Edit Event
                    </h2>
                </div>

                {/* Edit Form */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 px-5 md:px-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                name="title"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Coding workshop, etc." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                name="eventType"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Event Type *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Workshop, Meeting, etc." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            name="description"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Info about the event..."
                                            {...field}
                                            rows={3}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                            <FormField
                                name="startDate"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Start Date *</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "PPP")
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                                    captionLayout="dropdown"
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                name="endDate"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>End Date *</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "PPP")
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) => {
                                                        const startDate = form.getValues("startDate");
                                                        return date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                                                            (startDate && date < startDate);
                                                    }}
                                                    captionLayout="dropdown"
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            name="registrationDeadline"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Registration Deadline</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date (optional)</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) => {
                                                    const startDate = form.getValues("startDate");
                                                    return date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                                                        (startDate && date > startDate);
                                                }}
                                                captionLayout="dropdown"
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                            <FormField
                                name="location"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Location *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Location" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                name="capacity"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Capacity</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="Max. no. of participants (optional)"
                                                value={field.value || ''}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    field.onChange(value === '' ? undefined : Number(value));
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                            <FormField
                                name="status"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="draft">Draft</SelectItem>
                                                <SelectItem value="planned">Planned</SelectItem>
                                                <SelectItem value="ongoing">Ongoing</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                name="entryFee"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Entry Fee</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                value={field.value || ''}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    field.onChange(value === '' ? 0 : Number(value));
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                name="isPublic"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <div className="space-y-0.5">
                                            <FormLabel>Make this event public</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                name="registrationRequired"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <div className="space-y-0.5">
                                            <FormLabel>Registration Required</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            name="certificateProvided"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel>Certificate Provided</FormLabel>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            variant="green"
                            disabled={isUpdating}
                            className="w-full"
                        >
                            {isUpdating ? "Updating..." : "Update Event"}
                        </Button>
                    </form>
                </Form>
            </div>
        </main>
    );
}
