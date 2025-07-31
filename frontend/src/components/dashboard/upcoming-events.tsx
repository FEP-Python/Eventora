import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, MoreHorizontal, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const UpcomingEvents = () => {
    const events = [
        {
            id: 1,
            title: "Tech Symposium 2024",
            date: "Mar 15, 2024",
            time: "9:00 AM",
            location: "Main Auditorium",
            attendees: 150,
            status: "confirmed",
            priority: "high",
            budget: "₹25,000",
        },
        {
            id: 2,
            title: "Coding Workshop",
            date: "Mar 18, 2024",
            time: "2:00 PM",
            location: "Computer Lab",
            attendees: 45,
            status: "planning",
            priority: "medium",
            budget: "₹5,000",
        },
        {
            id: 3,
            title: "Alumni Meetup",
            date: "Mar 22, 2024",
            time: "6:00 PM",
            location: "Conference Hall",
            attendees: 80,
            status: "confirmed",
            priority: "low",
            budget: "₹15,000",
        },
    ]

    const getStatusColor = (status: string) => {
        switch (status) {
            case "confirmed":
                return "bg-[#588157]/20 text-[#3A5A40] border-[#588157]/30"
            case "planning":
                return "bg-[#A3B18A]/20 text-[#3A5A40] border-[#A3B18A]/30"
            case "cancelled":
                return "bg-red-100 text-red-800 border-red-200"
            default:
                return "bg-[#DAD7CD]/50 text-[#3A5A40] border-[#A3B18A]/30"
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high":
                return "bg-red-100 text-red-800 border-red-200"
            case "medium":
                return "bg-[#A3B18A]/20 text-[#3A5A40] border-[#A3B18A]/30"
            case "low":
                return "bg-[#588157]/20 text-[#3A5A40] border-[#588157]/30"
            default:
                return "bg-[#DAD7CD]/50 text-[#3A5A40] border-[#A3B18A]/30"
        }
    }

    return (
        <Card className="bg-white/80 backdrop-blur-sm border-[#A3B18A]/20">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center space-x-2 text-[#344E41]">
                            <Calendar className="h-5 w-5" />
                            <span className="font-semibold text-lg">Upcoming Events</span>
                        </CardTitle>
                        <CardDescription className="text-[#3A5A40]">Events scheduled for the next 30 days</CardDescription>
                    </div>
                    <Link href="/dashboard/events">
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-[#A3B18A]/30 text-[#3A5A40] hover:bg-[#A3B18A]/10 bg-transparent"
                        >
                            View All
                        </Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {events.map((event) => (
                        <div
                            key={event.id}
                            className="border border-[#A3B18A]/20 rounded-lg p-4 hover:bg-[#DAD7CD]/20 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-semibold text-[#344E41] mb-1">{event.title}</h3>
                                    <div className="flex items-center space-x-4 text-sm text-[#3A5A40]">
                                        <div className="flex items-center space-x-1">
                                            <Calendar className="h-4 w-4" />
                                            <span>{event.date}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Clock className="h-4 w-4" />
                                            <span>{event.time}</span>
                                        </div>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="text-[#3A5A40] hover:bg-[#DAD7CD]/30">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 text-sm text-[#3A5A40]">
                                    <div className="flex items-center space-x-1">
                                        <MapPin className="h-4 w-4" />
                                        <span>{event.location}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Users className="h-4 w-4" />
                                        <span>{event.attendees} attendees</span>
                                    </div>
                                    <span className="font-medium text-[#344E41]">{event.budget}</span>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Badge className={getPriorityColor(event.priority)}>{event.priority}</Badge>
                                    <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
