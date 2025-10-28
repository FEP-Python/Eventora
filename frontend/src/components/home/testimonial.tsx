"use client";

import React, { useState } from 'react'
import { Award, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

const testimonials = [
    {
        name: "Sarah Chen",
        role: "President, Tech Club",
        college: "MIT",
        content:
            "Eventora transformed how we manage our events. From planning to execution, everything is streamlined and efficient.",
        rating: 5,
        avatar: "/placeholder.svg?height=60&width=60",
    },
    {
        name: "Mike Rodriguez",
        role: "Event Coordinator, Cultural Society",
        college: "Stanford University",
        content:
            "The budget tracking feature saved us from overspending. We can now plan better and allocate resources efficiently.",
        rating: 5,
        avatar: "/placeholder.svg?height=60&width=60",
    },
    {
        name: "Lisa Wang",
        role: "Secretary, Student Council",
        college: "Harvard University",
        content: "Task management has never been easier. Our team productivity increased by 40% after using Eventora.",
        rating: 5,
        avatar: "/placeholder.svg?height=60&width=60",
    },
];

const Testimonial = () => {
    const [activeTestimonial, setActiveTestimonial] = useState(0);

    return (
        <section id='testimonials' className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <Badge className="bg-[#3A5A40] text-white mb-4">
                        <Award className="h-4 w-4 mr-2" />
                        Testimonials
                    </Badge>
                    <h2 className="text-3xl lg:text-4xl font-bold text-[#344E41] mb-6">What Our Users Say</h2>
                    <p className="text-xl text-[#3A5A40] max-w-3xl mx-auto">
                        Don&apos;t just take our word for it. Here&apos;s what event organizers from top colleges say about Eventora.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto">
                    <Card className="bg-white border-[#A3B18A]/20">
                        <CardContent className="p-8">
                            <div className="text-center mb-8">
                                <div className="flex justify-center mb-4">
                                    {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                                <blockquote className="text-xl text-[#344E41] mb-6 italic">
                                    {testimonials[activeTestimonial].content}
                                </blockquote>
                                <div className="flex items-center justify-center space-x-4">
                                    {/* <Image
                                            src={testimonials[activeTestimonial].avatar || "/placeholder.svg"}
                                            alt={testimonials[activeTestimonial].name}
                                            className="w-12 h-12 rounded-full"
                                        /> */}
                                    <div className="text-left">
                                        <p className="font-semibold text-[#344E41]">{testimonials[activeTestimonial].name}</p>
                                        <p className="text-[#3A5A40] text-sm">
                                            {testimonials[activeTestimonial].role}, {testimonials[activeTestimonial].college}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center space-x-2">
                                {testimonials.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveTestimonial(index)}
                                        className={`w-3 h-3 rounded-full transition-colors ${index === activeTestimonial ? "bg-[#588157]" : "bg-[#A3B18A]/30"
                                            }`}
                                    />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    )
}

export default Testimonial
