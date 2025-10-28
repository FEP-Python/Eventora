"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserAllOrgs } from "@/hooks/use-users-org";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useIsAuthenticated, useCurrentUser } from "@/hooks/use-auth";
import { Menu, X, LogOut, Settings, User as UserIcon } from "lucide-react";

const Header = () => {
    const router = useRouter();
    const { isAuthenticated } = useIsAuthenticated();
    const { data: currentUser } = useCurrentUser();
    const { hasOrganizations, data: orgs, isLoading: loadingOrgs } = useUserAllOrgs();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleSignOut = () => {
        localStorage.removeItem("token");
        router.push("/sign-in");
        router.refresh();
    };

    const getUserInitials = () => {
        if (!currentUser) return "U";
        const first = currentUser.firstName?.charAt(0) || "";
        const last = currentUser.lastName?.charAt(0) || "";
        return `${first}${last}`.toUpperCase() || "U";
    };

    // Loading state
    const isLoading = loadingOrgs;

    return (
        <nav className="bg-white/90 backdrop-blur-md border-b border-[#A3B18A]/20 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Image
                        src="/logo.svg"
                        alt="logo"
                        width={150}
                        height={150}
                        className="object-cover cursor-pointer"
                        onClick={() => router.push("/")}
                    />

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <a
                            href="#features"
                            className="text-[#344E41] hover:text-[#3A5A40] transition-colors font-medium"
                        >
                            Features
                        </a>
                        <a
                            href="#how-it-works"
                            className="text-[#344E41] hover:text-[#3A5A40] transition-colors font-medium"
                        >
                            How it Works
                        </a>
                        <a
                            href="#testimonials"
                            className="text-[#344E41] hover:text-[#3A5A40] transition-colors font-medium"
                        >
                            Testimonials
                        </a>
                        <a
                            href="#contact"
                            className="text-[#344E41] hover:text-[#3A5A40] transition-colors font-medium"
                        >
                            Contact
                        </a>

                        {/* Auth Buttons */}
                        <div className="flex items-center gap-x-3">
                            {isLoading ? (
                                <>
                                    <Skeleton className="h-10 w-24" />
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                </>
                            ) : isAuthenticated ? (
                                <>
                                    {/* Dashboard/Create Club Button */}
                                    {hasOrganizations && orgs && orgs.length > 0 ? (
                                        <Button
                                            variant="default"
                                            className="bg-[#3A5A40] hover:bg-[#344E41] text-white"
                                            onClick={() => router.push(`/orgs/${orgs[0].id}`)}
                                        >
                                            Dashboard
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="default"
                                            className="bg-[#3A5A40] hover:bg-[#344E41] text-white"
                                            onClick={() => router.push("/create-org")}
                                        >
                                            Create Club
                                        </Button>
                                    )}
                                </>
                            ) : (
                                <>
                                    <Button
                                        variant="ghost"
                                        className="text-[#344E41] hover:text-[#3A5A40] hover:bg-[#A3B18A]/10"
                                        onClick={() => router.push("/sign-in")}
                                    >
                                        Sign In
                                    </Button>
                                    <Button
                                        variant="default"
                                        className="bg-[#3A5A40] hover:bg-[#344E41] text-white"
                                        onClick={() => router.push("/sign-up")}
                                    >
                                        Get Started
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-[#344E41]"
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-[#A3B18A]/20">
                        <div className="flex flex-col space-y-4">
                            {/* Navigation Links */}
                            <a
                                href="#features"
                                className="text-[#344E41] hover:text-[#3A5A40] transition-colors font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Features
                            </a>
                            <a
                                href="#how-it-works"
                                className="text-[#344E41] hover:text-[#3A5A40] transition-colors font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                How it Works
                            </a>
                            <a
                                href="#testimonials"
                                className="text-[#344E41] hover:text-[#3A5A40] transition-colors font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Testimonials
                            </a>
                            <a
                                href="#contact"
                                className="text-[#344E41] hover:text-[#3A5A40] transition-colors font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Contact
                            </a>

                            {/* Mobile Auth Section */}
                            <div className="pt-4 border-t border-[#A3B18A]/20">
                                {isLoading ? (
                                    <div className="flex flex-col space-y-2">
                                        <Skeleton className="h-10 w-full" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                ) : isAuthenticated ? (
                                    <div className="flex flex-col space-y-3">
                                        {/* User Info */}
                                        <div className="flex items-center space-x-3 p-3 bg-[#A3B18A]/10 rounded-lg">
                                            <Avatar className="h-10 w-10 border-2 border-[#A3B18A]">
                                                <AvatarFallback className="bg-[#3A5A40] text-white">
                                                    {getUserInitials()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <p className="text-sm font-medium text-[#344E41]">
                                                    {currentUser?.firstName} {currentUser?.lastName}
                                                </p>
                                                <p className="text-xs text-[#588157]">
                                                    {currentUser?.email}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Dashboard/Create Club Button */}
                                        {hasOrganizations && orgs && orgs.length > 0 ? (
                                            <Button
                                                className="w-full bg-[#3A5A40] hover:bg-[#344E41] text-white"
                                                onClick={() => {
                                                    router.push(`/orgs/${orgs[0].id}`);
                                                    setIsMenuOpen(false);
                                                }}
                                            >
                                                Dashboard
                                            </Button>
                                        ) : (
                                            <Button
                                                className="w-full bg-[#3A5A40] hover:bg-[#344E41] text-white"
                                                onClick={() => {
                                                    router.push("/create-org");
                                                    setIsMenuOpen(false);
                                                }}
                                            >
                                                Create Club
                                            </Button>
                                        )}

                                        {/* Additional Actions */}
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => {
                                                router.push("/profile");
                                                setIsMenuOpen(false);
                                            }}
                                        >
                                            <UserIcon className="mr-2 h-4 w-4" />
                                            Profile
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => {
                                                router.push("/settings");
                                                setIsMenuOpen(false);
                                            }}
                                        >
                                            <Settings className="mr-2 h-4 w-4" />
                                            Settings
                                        </Button>

                                        {/* Sign Out */}
                                        <Button
                                            variant="outline"
                                            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => {
                                                handleSignOut();
                                                setIsMenuOpen(false);
                                            }}
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Sign Out
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col space-y-2">
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => {
                                                router.push("/sign-in");
                                                setIsMenuOpen(false);
                                            }}
                                        >
                                            Sign In
                                        </Button>
                                        <Button
                                            className="w-full bg-[#3A5A40] hover:bg-[#344E41] text-white"
                                            onClick={() => {
                                                router.push("/sign-up");
                                                setIsMenuOpen(false);
                                            }}
                                        >
                                            Get Started
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Header;
