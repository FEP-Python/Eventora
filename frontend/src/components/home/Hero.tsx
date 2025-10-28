"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useIsAuthenticated } from '@/hooks/use-auth';
import { useUserAllOrgs } from '@/hooks/use-users-org';
import { ArrowRight, CheckCircle } from 'lucide-react';

const Hero = () => {
    const router = useRouter();
    const { isAuthenticated } = useIsAuthenticated();
    const { hasOrganizations, data: orgs } = useUserAllOrgs();

    const handleGetStarted = () => {
        if (isAuthenticated && hasOrganizations) {
            router.push(`/org/${orgs![0].id}/dashboard`);
        } else {
            router.push('/sign-up');
        }
    };

    return (
        <section className="relative py-16 md:py-24 lg:py-32 overflow-hidden bg-[#F0F9EF]">
            {/* Background Gradient */}
            {/* <div className="absolute inset-0 bg-gradient-to-br from-[#A3B18A]/20 via-[#588157]/10 to-[#DAD7CD]/30"></div> */}

            {/* Decorative Elements */}
            <div className="absolute top-10 right-10 w-72 h-72 bg-[#588157]/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#A3B18A]/10 rounded-full blur-3xl"></div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center text-center">
                <div className="text-center flex flex-col items-center justify-center">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-[#344E41] mb-6 leading-tight">
                        Streamline Your College Events with{' '}
                        <span className="text-[#588157] relative inline-block">
                            Eventora
                            <svg className="absolute bottom-[1px] left-0 w-full" height="8" viewBox="0 0 200 8" fill="none">
                                <path d="M0 4C50 1 150 7 200 4" stroke="#588157" strokeWidth="3" strokeLinecap="round" />
                            </svg>
                        </span>
                    </h1>

                    <p className="text-lg sm:text-xl text-[#3A5A40] mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                        The complete event management platform for college clubs. Plan events, manage teams,
                        track budgets, and collaborate seamlessly - all in one place.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                        <Button
                            size="lg"
                            className="bg-[#3A5A40] hover:bg-[#344E41] text-white text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
                            onClick={handleGetStarted}
                        >
                            {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-2 border-[#3A5A40] text-[#3A5A40] hover:bg-[#3A5A40] hover:text-white text-lg px-8 py-6 rounded-xl transition-all"
                            onClick={() => {
                                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            Watch Demo
                        </Button>
                    </div>

                    {/* Trust Indicators */}
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-[#3A5A40]">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-[#588157]" />
                            <span>Free forever plan</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-[#588157]" />
                            <span>Setup in 2 minutes</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
