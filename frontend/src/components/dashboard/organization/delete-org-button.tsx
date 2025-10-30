"use client";

import { Org } from "@/type";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDeleteOrg } from "@/hooks/use-org";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle } from "lucide-react";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteOrganizationButtonProps {
    organization: Org;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
    className?: string;
    showIcon?: boolean;
}

export const DeleteOrganizationButton = ({
    organization = {} as Org,
    variant = "destructive",
    size = "default",
    className = "",
    showIcon = true,
}: DeleteOrganizationButtonProps) => {
    const deleteOrgMutation = useDeleteOrg();
    const [isOpen, setIsOpen] = useState(false);
    const [confirmText, setConfirmText] = useState("");

    const handleDelete = async () => {
        if (confirmText !== organization.name) {
            return;
        }

        deleteOrgMutation.mutate(organization.id, {
            onSuccess: () => {
                setIsOpen(false);
                setConfirmText("");
            },
        });
    };

    const isConfirmValid = confirmText === organization.name;

    return (
        <>
            <Button
                variant={variant}
                size={size}
                className={className}
                onClick={() => setIsOpen(true)}
            >
                {showIcon && <Trash2 className="h-4 w-4 mr-2" />}
                Delete club
            </Button>

            <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-red-100 rounded-full">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <AlertDialogTitle className="text-xl">
                                Delete Club
                            </AlertDialogTitle>
                        </div>
                        <AlertDialogDescription className="text-base space-y-4">
                            <p>
                                You are about to permanently delete{" "}
                                <strong className="text-red-600">
                                    {organization?.name}
                                </strong>
                                .
                            </p>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
                                <p className="font-semibold text-red-900 text-sm">
                                    ⚠️ This action cannot be undone. This will:
                                </p>
                                <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
                                    <li>Delete all events and their data</li>
                                    <li>Remove all team members and teams</li>
                                    <li>Delete all tasks and budgets</li>
                                    <li>Remove all club data permanently</li>
                                </ul>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="confirm-name" className="text-sm font-medium">
                                Type <code className="px-2 py-1 bg-gray-100 rounded text-red-600 font-mono text-sm">
                                    {organization.name}
                                </code> to confirm
                            </Label>
                            <Input
                                id="confirm-name"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                placeholder="Enter club name"
                                className={`${confirmText && !isConfirmValid
                                        ? "border-red-500 focus-visible:ring-red-500"
                                        : ""
                                    }`}
                                autoComplete="off"
                            />
                            {confirmText && !isConfirmValid && (
                                <p className="text-sm text-red-600">
                                    Club name doesn&apos;t match
                                </p>
                            )}
                        </div>
                    </div>

                    <AlertDialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsOpen(false);
                                setConfirmText("");
                            }}
                            disabled={deleteOrgMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={!isConfirmValid || deleteOrgMutation.isPending}
                        >
                            {deleteOrgMutation.isPending ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Forever
                                </>
                            )}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};
