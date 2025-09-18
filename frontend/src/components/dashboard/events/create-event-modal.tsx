// "use client";

// import * as z from "zod";
// import { useForm } from "react-hook-form";

// import { zodResolver } from "@hookform/resolvers/zod";
// import { useModalStore } from "@/hooks/use-modal-store";

// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { ResponsiveModal } from "@/components/responsive-modal";
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { cn } from "@/lib/utils";
// import { format } from "date-fns";
// import { CalendarIcon } from "lucide-react";
// import { Calendar } from "@/components/ui/calendar";
// import { Switch } from "@/components/ui/switch";
// import { useOrgEventManagement } from "@/hooks/use-event";
// import { useOrgStore } from "@/hooks/use-org-store";


// const formSchema = z.object({
//     title: z.string().min(1, "Name is required"),
//     description: z.string().optional(),
//     startDate: z.date(),
//     endDate: z.date(),
//     registrationDeadline: z.date(),
//     capacity: z.number().min(1, 'Capacity must be atleast one!'),
//     location: z.string(),
//     eventType: z.string(),
//     status: z.string(),
//     isPublic: z.boolean(),
//     registrationRequired: z.boolean(),
//     entryFee: z.number().min(0, 'Entry fee cannot be negative'),
//     certificateProvided: z.boolean(),
// });

// export const CreateEventModal = () => {
//     const { activeOrg } = useOrgStore();
//     const { isOpen, closeModal } = useModalStore();
//     const { createEvent, isCreating } = useOrgEventManagement(activeOrg?.id || 1);

//     const form = useForm<z.infer<typeof formSchema>>({
//         resolver: zodResolver(formSchema),
//         defaultValues: {
//             title: "",
//             description: "",
//             startDate: new Date(),
//             endDate: new Date(),
//             registrationDeadline: new Date(),
//             capacity: 0,
//             location: "",
//             eventType: "",
//             status: "",
//             entryFee: 0,
//             isPublic: false,
//             registrationRequired: false,
//             certificateProvided: false,
//         }
//     });

//     const handleSubmit = async (data: z.infer<typeof formSchema>) => {
//         const requestData = {
//             ...data,
//             status: data.status as "draft" | "planned" | "ongoing" | "completed" | "cancelled",
//             orgId: activeOrg?.id || 0,
//         }
//         createEvent(requestData);
//     }

//     return (
//         <ResponsiveModal
//             title="Create Event"
//             open={isOpen}
//             onOpenChange={closeModal}
//         >
//             <Form {...form}>
//                 <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <FormField
//                             name="title"
//                             control={form.control}
//                             render={({ field }) => (
//                                 <FormItem>
//                                     <FormLabel>Title</FormLabel>
//                                     <FormControl>
//                                         <Input placeholder="Coding workshop, etc." {...field} />
//                                     </FormControl>
//                                     <FormMessage />
//                                 </FormItem>
//                             )}
//                         />
//                         <FormField
//                             name="eventType"
//                             control={form.control}
//                             render={({ field }) => (
//                                 <FormItem>
//                                     <FormLabel>Event Type</FormLabel>
//                                     <FormControl>
//                                         <Input placeholder="Workshop, Meeting, etc." {...field} />
//                                     </FormControl>
//                                     <FormMessage />
//                                 </FormItem>
//                             )}
//                         />
//                     </div>
//                     <FormField
//                         name="description"
//                         control={form.control}
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel>Description</FormLabel>
//                                 <FormControl>
//                                     <Input placeholder="Info about the event..." {...field} />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
//                         <FormField
//                             name="startDate"
//                             control={form.control}
//                             render={({ field }) => (
//                                 <FormItem className="flex flex-col">
//                                     <FormLabel>Start Date</FormLabel>
//                                     <Popover>
//                                         <PopoverTrigger asChild>
//                                             <FormControl>
//                                                 <Button
//                                                     variant={"outline"}
//                                                     className={cn(
//                                                         "pl-3 text-left font-normal",
//                                                         !field.value && "text-muted-foreground"
//                                                     )}
//                                                 >
//                                                     {field.value ? (
//                                                         format(field.value, "PPP")
//                                                     ) : (
//                                                         <span>Pick a date</span>
//                                                     )}
//                                                     <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                                                 </Button>
//                                             </FormControl>
//                                         </PopoverTrigger>
//                                         <PopoverContent className="w-auto p-0" align="start">
//                                             <Calendar
//                                                 mode="single"
//                                                 selected={field.value}
//                                                 onSelect={field.onChange}
//                                                 // disabled={(date) =>
//                                                 //     date > new Date() || date < new Date("1900-01-01")
//                                                 // }
//                                                 captionLayout="dropdown"
//                                             />
//                                         </PopoverContent>
//                                     </Popover>
//                                     <FormMessage />
//                                 </FormItem>
//                             )}
//                         />
//                         <FormField
//                             name="endDate"
//                             control={form.control}
//                             render={({ field }) => (
//                                 <FormItem className="flex flex-col">
//                                     <FormLabel>End Date</FormLabel>
//                                     <Popover>
//                                         <PopoverTrigger asChild>
//                                             <FormControl>
//                                                 <Button
//                                                     variant={"outline"}
//                                                     className={cn(
//                                                         "pl-3 text-left font-normal",
//                                                         !field.value && "text-muted-foreground"
//                                                     )}
//                                                 >
//                                                     {field.value ? (
//                                                         format(field.value, "PPP")
//                                                     ) : (
//                                                         <span>Pick a date</span>
//                                                     )}
//                                                     <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                                                 </Button>
//                                             </FormControl>
//                                         </PopoverTrigger>
//                                         <PopoverContent className="w-auto p-0" align="start">
//                                             <Calendar
//                                                 mode="single"
//                                                 selected={field.value}
//                                                 onSelect={field.onChange}
//                                                 // disabled={(date) =>
//                                                 //     date > new Date() || date < new Date("1900-01-01")
//                                                 // }
//                                                 captionLayout="dropdown"
//                                             />
//                                         </PopoverContent>
//                                     </Popover>
//                                     <FormMessage />
//                                 </FormItem>
//                             )}
//                         />
//                     </div>
//                     <FormField
//                         name="registrationDeadline"
//                         control={form.control}
//                         render={({ field }) => (
//                             <FormItem className="flex flex-col">
//                                 <FormLabel>Registration Deadline</FormLabel>
//                                 <Popover>
//                                     <PopoverTrigger asChild>
//                                         <FormControl>
//                                             <Button
//                                                 variant={"outline"}
//                                                 className={cn(
//                                                     "pl-3 text-left font-normal",
//                                                     !field.value && "text-muted-foreground"
//                                                 )}
//                                             >
//                                                 {field.value ? (
//                                                     format(field.value, "PPP")
//                                                 ) : (
//                                                     <span>Pick a date</span>
//                                                 )}
//                                                 <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                                             </Button>
//                                         </FormControl>
//                                     </PopoverTrigger>
//                                     <PopoverContent className="w-auto p-0" align="start">
//                                         <Calendar
//                                             mode="single"
//                                             selected={field.value}
//                                             onSelect={field.onChange}
//                                             // disabled={(date) =>
//                                             //     date > new Date() || date < new Date("1900-01-01")
//                                             // }
//                                             captionLayout="dropdown"
//                                         />
//                                     </PopoverContent>
//                                 </Popover>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
//                         <FormField
//                             name="location"
//                             control={form.control}
//                             render={({ field }) => (
//                                 <FormItem>
//                                     <FormLabel>Location</FormLabel>
//                                     <FormControl>
//                                         <Input placeholder="Location" {...field} />
//                                     </FormControl>
//                                     <FormMessage />
//                                 </FormItem>
//                             )}
//                         />
//                         <FormField
//                             name="capacity"
//                             control={form.control}
//                             render={({ field }) => (
//                                 <FormItem>
//                                     <FormLabel>Capacity</FormLabel>
//                                     <FormControl>
//                                         <Input 
//                                             {...field} 
//                                             value={field.value || ''}
//                                             onChange={(e) => {
//                                                 const value = e.target.value;
//                                                 field.onChange(value === '' ? undefined : Number(value))
//                                             }}
//                                             type="number" 
//                                             placeholder="Max. no. of participants" 
//                                         />
//                                     </FormControl>
//                                     <FormMessage />
//                                 </FormItem>
//                             )}
//                         />
//                     </div>
//                     <FormField
//                         name="entryFee"
//                         control={form.control}
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel>Entry Fee</FormLabel>
//                                 <FormControl>
//                                     <Input 
//                                         {...field} 
//                                         value={field.value || ''}
//                                         onChange={(e) => {
//                                             const value = e.target.value;
//                                             field.onChange(value === '' ? undefined : Number(value))
//                                         }}
//                                         type="number" 
//                                     />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <FormField
//                             name="isPublic"
//                             control={form.control}
//                             render={({ field }) => (
//                                 <FormItem className="flex items-center w-full">
//                                     <FormLabel>Make this event public</FormLabel>
//                                     <FormControl>
//                                         <Switch 
//                                             checked={field.value} 
//                                             onCheckedChange={field.onChange} 
//                                             className="!cursor-pointer" 
//                                         />
//                                     </FormControl>
//                                     <FormMessage />
//                                 </FormItem>
//                             )}
//                         />
//                         <FormField
//                             name="registrationRequired"
//                             control={form.control}
//                             render={({ field }) => (
//                                 <FormItem className="flex items-center w-full">
//                                     <FormLabel>Registration Required?</FormLabel>
//                                     <FormControl>
//                                         <Switch 
//                                             checked={field.value} 
//                                             onCheckedChange={field.onChange} 
//                                             className="!cursor-pointer" 
//                                         />
//                                     </FormControl>
//                                     <FormMessage />
//                                 </FormItem>
//                             )}
//                         />
//                     </div>
//                     <FormField
//                         name="certificateProvided"
//                         control={form.control}
//                         render={({ field }) => (
//                             <FormItem className="flex items-center w-full">
//                                 <FormLabel>Certificate Provided?</FormLabel>
//                                 <FormControl>
//                                     <Switch 
//                                         checked={field.value} 
//                                         onCheckedChange={field.onChange} 
//                                         className="!cursor-pointer" 
//                                     />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />
//                     <Button
//                         type="submit"
//                         variant="green"
//                         disabled={isCreating}
//                     >
//                         {isCreating ? "Creating..." : "Create"}
//                     </Button>
//                 </form>
//             </Form>
//         </ResponsiveModal>
//     );
// }


"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useModalStore } from "@/hooks/use-modal-store";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useOrgEventManagement } from "@/hooks/use-event";
import { useOrgStore } from "@/hooks/use-org-store";

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
    // Ensure end date is after start date
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

export const CreateEventModal = () => {
    const { activeOrg } = useOrgStore();
    const { isOpen, closeModal } = useModalStore();
    const { createEvent, isCreating } = useOrgEventManagement(activeOrg?.id || 1);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            startDate: new Date(),
            endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Default to next day
            registrationDeadline: undefined,
            capacity: undefined,
            location: "",
            eventType: "",
            status: "draft",
            entryFee: 0,
            isPublic: true,
            registrationRequired: false,
            certificateProvided: false,
        }
    });

    const handleSubmit = async (data: z.infer<typeof formSchema>) => {
        const requestData = {
            title: data.title,
            description: data.description || "",
            startDate: data.startDate.toISOString(),
            endDate: data.endDate.toISOString(),
            registrationDeadline: data.registrationDeadline?.toISOString() || null,
            capacity: data.capacity || null,
            location: data.location,
            eventType: data.eventType,
            status: data.status,
            isPublic: data.isPublic,
            registrationRequired: data.registrationRequired,
            entryFee: data.entryFee,
            certificateProvided: data.certificateProvided,
            orgId: activeOrg?.id || 0,
        };

        try {
            await createEvent(requestData);
            closeModal();
            form.reset();
        } catch (error) {
            console.error("Error creating event:", error);
        }
    };

    return (
        <ResponsiveModal
            title="Create Event"
            open={isOpen}
            onOpenChange={closeModal}
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
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
                        disabled={isCreating}
                        className="w-full"
                    >
                        {isCreating ? "Creating..." : "Create Event"}
                    </Button>
                </form>
            </Form>
        </ResponsiveModal>
    );
}