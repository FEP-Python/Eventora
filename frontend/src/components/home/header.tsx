"use client";

import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const Header = () => {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="bg-white/90 backdrop-blur-md border-b border-[#A3B18A]/20 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Image
                            src="/logo.svg"
                            alt="logo"
                            width={150}
                            height={150}
                            className="object-cover cursor-pointer"
                            onClick={() => router.push("/")}
                        />
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#features" className="text-[#344E41] hover:text-[#3A5A40] transition-colors">
                                Features
                            </a>
                            <a href="#how-it-works" className="text-[#344E41] hover:text-[#3A5A40] transition-colors">
                                How it Works
                            </a>
                            <a href="#testimonials" className="text-[#344E41] hover:text-[#3A5A40] transition-colors">
                                Testimonials
                            </a>
                            <a href="#contact" className="text-[#344E41] hover:text-[#3A5A40] transition-colors">
                                Contact
                            </a>
                            <Button
                                className="bg-[#3A5A40] hover:bg-[#344E41] text-white"
                                onClick={() => router.push("/sign-in")}
                            >
                                Get Started
                            </Button>
                        </div>

                        <div className="md:hidden">
                            <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-[#344E41]">
                                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </Button>
                        </div>
                    </div>

                    {/* Mobile Navigation */}
                    {isMenuOpen && (
                        <div className="md:hidden py-4 border-t border-[#A3B18A]/20">
                            <div className="flex flex-col space-y-4">
                                <a href="#features" className="text-[#344E41] hover:text-[#3A5A40] transition-colors">
                                    Features
                                </a>
                                <a href="#how-it-works" className="text-[#344E41] hover:text-[#3A5A40] transition-colors">
                                    How it Works
                                </a>
                                <a href="#testimonials" className="text-[#344E41] hover:text-[#3A5A40] transition-colors">
                                    Testimonials
                                </a>
                                <a href="#contact" className="text-[#344E41] hover:text-[#3A5A40] transition-colors">
                                    Contact
                                </a>
                                <div className="flex flex-col space-y-2 pt-4">
                                    <Button
                                        className="bg-[#3A5A40] hover:bg-[#344E41] text-white"
                                        onClick={() => router.push("/sign-in")}
                                    >
                                        Get Started
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </nav>
    )
}

export default Header;
