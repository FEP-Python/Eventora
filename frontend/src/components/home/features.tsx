import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Calendar, CheckSquare, DollarSign, Lightbulb, Shield, Users } from 'lucide-react'

const Features = () => {
    const features = [
        {
            icon: Calendar,
            title: "Event Management",
            description: "Create, organize, and manage events with sub-events, attendee tracking, and real-time updates.",
            color: "bg-[#588157]",
        },
        {
            icon: Users,
            title: "Team Collaboration",
            description: "Build teams, assign roles, and collaborate seamlessly with your organization members.",
            color: "bg-[#A3B18A]",
        },
        {
            icon: CheckSquare,
            title: "Task Management",
            description: "Track tasks with Kanban boards, set priorities, assign deadlines, and monitor progress.",
            color: "bg-[#3A5A40]",
        },
        {
            icon: DollarSign,
            title: "Budget Tracking",
            description: "Monitor expenses, track budgets by category, and generate financial reports effortlessly.",
            color: "bg-[#588157]",
        },
        {
            icon: BarChart3,
            title: "Analytics & Reports",
            description: "Get insights with detailed analytics, performance metrics, and exportable reports.",
            color: "bg-[#A3B18A]",
        },
        {
            icon: Shield,
            title: "Secure & Reliable",
            description: "Enterprise-grade security with role-based access control and data protection.",
            color: "bg-[#3A5A40]",
        },
    ]

  return (
    <section id="features" className="py-20 bg-[#DAD7CD]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <Badge className="bg-[#588157] text-white mb-4">
                            <Lightbulb className="h-4 w-4 mr-2" />
                            Features
                        </Badge>
                        <h2 className="text-3xl lg:text-4xl font-bold text-[#344E41] mb-6">Everything You Need to Manage Events</h2>
                        <p className="text-xl text-[#3A5A40] max-w-3xl mx-auto">
                            From planning to execution, Eventora provides all the tools your organization needs to create successful
                            events.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <Card key={index} className="bg-white border-[#A3B18A]/20 hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                                        <feature.icon className="h-6 w-6 text-white" />
                                    </div>
                                    <CardTitle className="text-[#344E41]">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-[#3A5A40]">{feature.description}</CardDescription>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
  )
}

export default Features
