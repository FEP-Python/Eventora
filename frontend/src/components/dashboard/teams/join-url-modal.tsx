"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check } from "lucide-react";
import { useModalStore } from "@/hooks/use-modal-store";
import { useOrgStore } from "@/hooks/use-org-store";
import { toast } from "sonner";
import { frontend_url } from "@/constants";

export const JoinUrlModal = () => {
    const { isOpen, closeModal, type } = useModalStore();
    const { activeOrg } = useOrgStore();
    const [copied, setCopied] = useState(false);

    const isModalOpen = isOpen && type === "joinUrl";

    if (!activeOrg) return null;

    const joinUrl = `${frontend_url}/join-club?code=${activeOrg.code}`;

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(joinUrl);
            setCopied(true);
            toast.success("Join URL copied to clipboard!");

            setTimeout(() => {
                setCopied(false);
            }, 2000);
        } catch (err) {
            toast.error("Failed to copy URL");
        }
    };

    return (
        <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${isModalOpen ? 'block' : 'hidden'}`}>
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold">Share Club Invite</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Share this URL with others to invite them to join your club
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="joinUrl">Join URL</Label>
                        <div className="flex space-x-2">
                            <Input
                                id="joinUrl"
                                value={joinUrl}
                                readOnly
                                className="flex-1"
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={copyToClipboard}
                                className="px-3"
                            >
                                {copied ? (
                                    <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="orgCode">Club Code</Label>
                        <Input
                            id="orgCode"
                            value={activeOrg.code}
                            readOnly
                            className="font-mono text-center text-lg font-semibold"
                        />
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="outline" onClick={closeModal}>
                            Close
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};