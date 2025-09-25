'use client';

import Link from "next/link";
import { useEvent } from "@/hooks/use-event";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, Award, Building, Calendar, CheckCircle, Clock, Edit, Globe, Lock, Mail, MapPin, Phone, Share2, User, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";


interface EventDetailsProps {
    orgId: number;
    eventId: number;
}

const eventData = {
    capacity: 100,
    certificateProvided: true,
    createdAt: "2025-09-18T06:50:33.673130",
    creatorId: 1,
    description:
        "A comprehensive coding workshop covering modern web development technologies including React, Node.js, and database integration. Perfect for beginners and intermediate developers looking to enhance their skills.",
    endDate: "Mon, 29 Sep 2025 18:30:00 GMT",
    entryFee: 50,
    eventType: "Workshop",
    id: 2,
    isPublic: false,
    location: "DYP Akurdi",
    orgId: 1,
    registrationDeadline: "Sat, 20 Sep 2025 18:30:00 GMT",
    registrationRequired: true,
    startDate: "Wed, 24 Sep 2025 18:30:00 GMT",
    status: "planned",
    title: "Coding Workshop: Modern Web Development",
}

// Mock additional data that might be useful
const additionalData = {
    organizer: {
        name: "Tech Club",
        contact: "tech@college.edu",
        phone: "+91 98765 43210",
    },
    registrations: 45,
    speakers: [
        { name: "John Doe", role: "Senior Developer", company: "Tech Corp" },
        { name: "Jane Smith", role: "Full Stack Engineer", company: "StartupXYZ" },
    ],
    agenda: [
        { time: "18:30 - 19:00", topic: "Registration & Welcome" },
        { time: "19:00 - 20:00", topic: "Introduction to Modern Web Development" },
        { time: "20:00 - 20:15", topic: "Break" },
        { time: "20:15 - 21:15", topic: "Hands-on Coding Session" },
        { time: "21:15 - 21:30", topic: "Q&A and Closing" },
    ],
    requirements: [
        "Laptop with internet connection",
        "Basic knowledge of HTML/CSS",
        "Code editor (VS Code recommended)",
        "Node.js installed",
    ],
}

export const EventDetails = ({ orgId, eventId }: EventDetailsProps) => {
    const router = useRouter();
    const { data, isLoading } = useEvent(eventId);

    const formatTime = (dateString: Date) => {
        return new Date(dateString).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "planned":
                return "bg-[#A3B18A]/20 text-[#3A5A40] border-[#A3B18A]/30"
            case "ongoing":
                return "bg-[#588157]/20 text-[#3A5A40] border-[#588157]/30"
            case "completed":
                return "bg-[#3A5A40]/20 text-[#3A5A40] border-[#3A5A40]/30"
            case "cancelled":
                return "bg-red-100 text-red-800 border-red-200"
            default:
                return "bg-[#DAD7CD]/50 text-[#3A5A40] border-[#A3B18A]/30"
        }
    }

    const getEventTypeColor = (type: string) => {
        switch (type.toLowerCase()) {
            case "workshop":
                return "bg-[#588157]/20 text-[#3A5A40] border-[#588157]/30"
            case "seminar":
                return "bg-[#A3B18A]/20 text-[#3A5A40] border-[#A3B18A]/30"
            case "conference":
                return "bg-[#3A5A40]/20 text-[#3A5A40] border-[#3A5A40]/30"
            default:
                return "bg-[#DAD7CD]/50 text-[#3A5A40] border-[#A3B18A]/30"
        }
    }

    const isRegistrationOpen = () => {
        const deadline = new Date(eventData.registrationDeadline)
        const now = new Date()
        return now < deadline
    }

    const daysUntilEvent = () => {
        const startDate = new Date(eventData.startDate)
        const now = new Date()
        const diffTime = startDate.getTime() - now.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center w-full">
                Loading event data...
            </div>
        )
    }

    if (!data) {
        return (
            <div className="flex items-center justify-center w-full text-red-500">
                Event Data not found!!
            </div>
        )
    }

    return (
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <div className="max-w-7xl mx-auto">
                {/* Back Navigation */}
                <div className="mb-6">
                    <Link href="/events">
                        <Button variant="outline" onClick={() => router.back()}>
                            <ArrowLeft className="h-4 w-4" />
                            Back to Events
                        </Button>
                    </Link>
                </div>

                {/* Event Header */}
                <div className="mb-8">
                    <Card className="bg-white/80 backdrop-blur-sm border-[#A3B18A]/20">
                        <CardContent className="p-6 md:p-8">
                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-3 mb-4">
                                        <Badge className={getStatusColor(data.status)}>
                                            {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
                                        </Badge>
                                        <Badge className={getEventTypeColor(data.eventType)}>{data.eventType}</Badge>
                                        {data.certificateProvided && (
                                            <Badge className="bg-[#588157]/20 text-[#3A5A40] border-[#588157]/30">
                                                <Award className="h-3 w-3" />
                                                Certificate
                                            </Badge>
                                        )}
                                        {data.isPublic ? (
                                            <Badge className="bg-[#A3B18A]/20 text-[#3A5A40] border-[#A3B18A]/30">
                                                <Globe className="h-3 w-3" />
                                                Public
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-[#3A5A40]/20 text-[#3A5A40] border-[#3A5A40]/30">
                                                <Lock className="h-3 w-3" />
                                                Private
                                            </Badge>
                                        )}
                                    </div>

                                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#344E41] mb-4">
                                        {data.title}
                                    </h1>

                                    <p className="text-[#3A5A40] text-lg mb-6 leading-relaxed">{data.description}</p>

                                    {/* Key Info Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="flex items-center space-x-3 p-3 bg-[#DAD7CD]/30 rounded-lg">
                                            <Calendar className="h-5 w-5 text-[#588157]" />
                                            <div>
                                                <p className="text-sm text-[#3A5A40]">Start Date</p>
                                                <p className="font-medium text-[#344E41]">{format(data.startDate, 'do MMM yyyy')}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3 p-3 bg-[#DAD7CD]/30 rounded-lg">
                                            <Clock className="h-5 w-5 text-[#588157]" />
                                            <div>
                                                <p className="text-sm text-[#3A5A40]">Time</p>
                                                <p className="font-medium text-[#344E41]">
                                                    {formatTime(data.startDate)} - {formatTime(data.endDate)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3 p-3 bg-[#DAD7CD]/30 rounded-lg">
                                            <MapPin className="h-5 w-5 text-[#588157]" />
                                            <div>
                                                <p className="text-sm text-[#3A5A40]">Location</p>
                                                <p className="font-medium text-[#344E41]">{data.location}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3 p-3 bg-[#DAD7CD]/30 rounded-lg">
                                            <Users className="h-5 w-5 text-[#588157]" />
                                            <div>
                                                <p className="text-sm text-[#3A5A40]">Capacity</p>
                                                <p className="font-medium text-[#344E41]">
                                                    {data.capacity}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:min-w-[200px]">
                                    {data.registrationRequired && isRegistrationOpen() && (
                                        <Button className="bg-[#3A5A40] hover:bg-[#344E41] text-white">
                                            <User className="h-4 w-4 mr-2" />
                                            Register Now
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        className="border-[#A3B18A]/30 text-[#3A5A40] hover:bg-[#A3B18A]/10 bg-transparent"
                                    >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit Event
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Registration Status Alert */}
                {eventData.registrationRequired && (
                    <div className="mb-6">
                        <Card
                            className={`border-l-4 ${isRegistrationOpen() ? "border-l-[#588157] bg-[#588157]/5" : "border-l-red-500 bg-red-50"
                                } bg-white/80 backdrop-blur-sm border-[#A3B18A]/20`}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-3">
                                    {isRegistrationOpen() ? (
                                        <CheckCircle className="h-5 w-5 text-[#588157]" />
                                    ) : (
                                        <AlertCircle className="h-5 w-5 text-red-500" />
                                    )}
                                    <div>
                                        <p className="font-medium text-[#344E41]">
                                            {isRegistrationOpen() ? "Registration Open" : "Registration Closed"}
                                        </p>
                                        <p className="text-sm text-[#3A5A40]">
                                            {isRegistrationOpen()
                                                ? `Registration deadline: ${format(data.registrationDeadline, 'do MMM yyyy')}`
                                                : `Registration closed on ${format(data.registrationDeadline, 'do MMM yyyy')}`}
                                        </p>
                                    </div>
                                    {daysUntilEvent() > 0 && (
                                        <div className="ml-auto text-right">
                                            <p className="text-sm font-medium text-[#344E41]">{daysUntilEvent()} days</p>
                                            <p className="text-xs text-[#3A5A40]">until event</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Event Information */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="bg-white/80 backdrop-blur-sm border-[#A3B18A]/20">
                            <CardHeader>
                                <CardTitle className="text-[#344E41]">Event Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-[#3A5A40] mb-1">Event Type</p>
                                        <p className="text-[#344E41] font-bold">{data.eventType}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-[#3A5A40] mb-1">Entry Fee</p>
                                        <p className="text-[#344E41] font-bold">₹{data.entryFee}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-[#3A5A40] mb-1">Duration</p>
                                        <p className="text-[#344E41] font-bold">
                                            {Math.ceil(
                                                (new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) /
                                                (1000 * 60 * 60),
                                            )}{" "}
                                            hours
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-[#3A5A40] mb-1">Created</p>
                                        <p className="text-[#344E41] font-bold">{format(eventData.createdAt, 'do MMM yyyy')}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-[#3A5A40] mb-1">Registeration</p>
                                        <p className="text-[#344E41] font-bold">{data.registrationRequired ? 'Required' : 'Not required'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-[#3A5A40] mb-1">Event Status</p>
                                        <p className="text-[#344E41] font-bold capitalize">{data.status}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-[#3A5A40] mb-1">Certificate Provided</p>
                                        <p className="text-[#344E41] font-bold">{data.certificateProvided ? 'Yes' : 'No'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        {/* Organizer Info */}
                        <Card className="bg-white/80 backdrop-blur-sm border-[#A3B18A]/20">
                            <CardHeader>
                                <CardTitle className="text-[#344E41]">Organizer</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <Building className="h-5 w-5 text-[#588157]" />
                                    <span className="text-[#344E41] font-medium">{additionalData.organizer.name}</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Mail className="h-5 w-5 text-[#588157]" />
                                    <span className="text-[#3A5A40]">{additionalData.organizer.contact}</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Phone className="h-5 w-5 text-[#588157]" />
                                    <span className="text-[#3A5A40]">{additionalData.organizer.phone}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </main>
    )
}