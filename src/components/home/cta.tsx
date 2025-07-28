"use client";

import React from 'react'
import { ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button'

const CTA = () => {
    const router = useRouter();

    return (
        <section className="py-20 bg-[#3A5A40]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">Ready to Transform Your Event Management?</h2>
                <p className="text-xl text-[#A3B18A] mb-8 max-w-3xl mx-auto">
                    Join thousands of organizations already using Eventora to create amazing events. Start your free trial
                    today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button onClick={() => router.push('/sign-in')} size="lg" className="bg-white text-[#3A5A40] hover:bg-[#DAD7CD]">
                        Get Started
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        className="border-white text-white hover:bg-white hover:text-[#3A5A40] bg-transparent"
                        asChild
                    >
                        <a href="#contact">Contact Us</a>
                    </Button>
                </div>
            </div>
        </section>
    )
}

export default CTA
