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
import { useTaskActions } from "@/hooks/use-task";


interface DeleteTaskDialogProps {
    taskId: number;
    open: boolean;
    onClose: (open: boolean) => void;
}

export const DeleteTaskDialog = ({ taskId, open, onClose }: DeleteTaskDialogProps) => {
    const { deleteTask, isDeleting } = useTaskActions(taskId);

    const handleDelete = () => {
        deleteTask();
        onClose(false);
    };

    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Task</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete this task? This action cannot be undone.
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
