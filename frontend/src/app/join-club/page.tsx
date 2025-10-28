"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useJoinOrg } from "@/hooks/use-org";
import { useIsAuthenticated } from "@/hooks/use-auth";
import { toast } from "sonner";
import Link from "next/link";

export default function JoinClubPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const code = searchParams.get("code");
    const [joinSuccess, setJoinSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { isAuthenticated } = useIsAuthenticated();
    const { mutate: joinOrg, isPending: isJoining } = useJoinOrg();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push(`/sign-in?redirect=${encodeURIComponent(window.location.href)}`);
        }
    }, [isAuthenticated, router]);

    const handleJoinOrg = async (orgCode: string) => {
        setError(null);

        joinOrg(orgCode, {
            onSuccess: (result) => {
                setJoinSuccess(true);
                toast.success("Successfully joined the organization!");

                // Redirect to main dashboard page after 2 seconds
                setTimeout(() => {
                    router.push(`/orgs/${result.org.id}`);
                }, 2000);
            },
            onError: (err) => {
                console.log("Error details:", err); // This will help debug

                // Extract the actual error message from the response
                let errorMessage = "Failed to join organization";

                if (err?.response?.data?.message) {
                    errorMessage = err.response.data.message;
                } else if (err?.message) {
                    errorMessage = err.message;
                }

                setError(errorMessage);
                toast.error(errorMessage);
            }
        });
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p>Redirecting to sign in...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
                        <Users className="h-8 w-8 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl">Join Club</CardTitle>
                    <CardDescription>
                        Enter the club code to join and become a member
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {joinSuccess ? (
                        <div className="text-center space-y-4">
                            <div className="mx-auto p-3 bg-green-100 rounded-full w-fit">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-green-800">Welcome to the club!</h3>
                                <p className="text-sm text-green-600 mt-1">
                                    You have successfully joined. Redirecting to teams page...
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <Alert variant="destructive">
                                    <XCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="orgCode">Club Code</Label>
                                <Input
                                    id="orgCode"
                                    placeholder="Enter club code"
                                    defaultValue={code || ""}
                                    disabled={isJoining}
                                />
                            </div>

                            <Button
                                className="w-full"
                                onClick={() => {
                                    const input = document.getElementById("orgCode") as HTMLInputElement;
                                    const orgCode = input?.value?.trim();
                                    if (orgCode) {
                                        handleJoinOrg(orgCode);
                                    } else {
                                        setError("Please enter a valid club code");
                                    }
                                }}
                                disabled={isJoining}
                            >
                                {isJoining ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Joining...
                                    </>
                                ) : (
                                    "Join Club"
                                )}
                            </Button>
                        </>
                    )}
                </CardContent>
                <CardFooter>
                    Don&apos;t have code? {" "}
                    <Link href='/create-org' className="underline text-[#3A5A40] ml-1">
                        Create Club
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
