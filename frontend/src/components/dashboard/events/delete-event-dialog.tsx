"use client";

import { Loader2 } from "lucide-react";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useEventActions } from "@/hooks/use-event";
import { useRouter } from "next/navigation";


interface DeleteEventDialogProps {
    eventId: number;
    open: boolean;
    onClose: (open: boolean) => void;
}

export const DeleteEventDialog = ({ eventId, open, onClose }: DeleteEventDialogProps) => {
    const router = useRouter();
    const { event, deleteEvent, isDeleting } = useEventActions(eventId);

    const handleDelete = () => {
        deleteEvent();
        onClose(false);
        if (event?.orgId) {
            router.push(`/orgs/${event.orgId}/events`);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Event</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete this event? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => onClose(false)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/70">
                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
