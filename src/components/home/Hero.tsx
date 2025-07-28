"use client";

import React from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, Calendar, Users} from 'lucide-react'

const Hero = () => {
    const router = useRouter();

  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#A3B18A]/20 to-[#588157]/20"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h1 className="text-4xl lg:text-6xl font-bold text-[#344E41] mb-6 leading-tight">
                                Streamline Your College Events with <span className="text-[#588157]">Eventora</span>
                            </h1>
                            <p className="text-xl text-[#3A5A40] mb-8 leading-relaxed">
                                The complete event management platform for college clubs. Plan events, manage teams, track budgets, and
                                collaborate seamlessly - all in one place.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                <Button
                                    size="lg"
                                    className="bg-[#3A5A40] hover:bg-[#344E41] text-white"
                                    onClick={() => router.push('/sign-in')}
                                >
                                    Get Started
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-[#A3B18A]/20">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-[#344E41]">Event Dashboard</h3>
                                        <Badge className="bg-[#588157] text-white">Live</Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-[#DAD7CD] p-4 rounded-lg">
                                            <Calendar className="h-8 w-8 text-[#3A5A40] mb-2" />
                                            <p className="text-2xl font-bold text-[#344E41]">4</p>
                                            <p className="text-sm text-[#3A5A40]">Active Events</p>
                                        </div>
                                        <div className="bg-[#A3B18A]/20 p-4 rounded-lg">
                                            <Users className="h-8 w-8 text-[#3A5A40] mb-2" />
                                            <p className="text-2xl font-bold text-[#344E41]">27</p>
                                            <p className="text-sm text-[#3A5A40]">Team Members</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-[#588157]/10 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-3 h-3 bg-[#588157] rounded-full"></div>
                                                <span className="text-[#344E41] font-medium">GDGC</span>
                                            </div>
                                            <Badge variant="outline" className="border-[#588157] text-[#588157]">
                                                In Progress
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-[#A3B18A]/10 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-3 h-3 bg-[#A3B18A] rounded-full"></div>
                                                <span className="text-[#344E41] font-medium">Coding Workshop</span>
                                            </div>
                                            <Badge variant="outline" className="border-[#A3B18A] text-[#A3B18A]">
                                                Planning
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
  )
}

export default Hero
