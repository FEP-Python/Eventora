import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Building2, Calendar, Clock, Target, Users } from 'lucide-react'

const HowItWorks = () => {
    const howItWorks = [
        {
            step: "01",
            title: "Create Your Organization",
            description: "Set up your college club or organization profile with team details and preferences.",
            icon: Building2,
        },
        {
            step: "02",
            title: "Build Your Teams",
            description: "Invite members, assign roles, and organize your teams for different functions.",
            icon: Users,
        },
        {
            step: "03",
            title: "Plan Your Events",
            description: "Create events, set budgets, assign tasks, and track everything in one place.",
            icon: Calendar,
        },
        {
            step: "04",
            title: "Execute & Monitor",
            description: "Use our dashboard to monitor progress, track expenses, and ensure successful events.",
            icon: Target,
        },
    ]

    return (
        <section id="how-it-works" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <Badge className="bg-[#A3B18A] text-white mb-4">
                        <Clock className="h-4 w-4 mr-2" />
                        How It Works
                    </Badge>
                    <h2 className="text-3xl lg:text-4xl font-bold text-[#344E41] mb-6">Get Started in 4 Simple Steps</h2>
                    <p className="text-xl text-[#3A5A40] max-w-3xl mx-auto">
                        Setting up your organization and managing events has never been easier. Follow these simple steps to get
                        started.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {howItWorks.map((step, index) => (
                        <div key={index} className="text-center">
                            <div className="relative mb-8">
                                <div className="w-16 h-16 bg-[#588157] rounded-full flex items-center justify-center mx-auto mb-4">
                                    <step.icon className="h-8 w-8 text-white" />
                                </div>
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#3A5A40] rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">{step.step}</span>
                                </div>
                                {index < howItWorks.length - 1 && (
                                    <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-[#A3B18A]/30 -translate-x-8"></div>
                                )}
                            </div>
                            <h3 className="text-xl font-semibold text-[#344E41] mb-4">{step.title}</h3>
                            <p className="text-[#3A5A40]">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default HowItWorks;
