import Link from "next/link";
import { Event } from "@/type";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";


interface UpcomingEventsProps {
    orgId: number;
    events: Event[] | [];
}

export const UpcomingEvents = ({ orgId, events }: UpcomingEventsProps) => {
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

    return (
        <Card className="bg-white/80 backdrop-blur-sm border-[#A3B18A]/20">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center space-x-2 text-[#344E41]">
                            <Calendar className="h-5 w-5" />
                            <span className="font-semibold text-lg">Recent Events</span>
                        </CardTitle>
                        <CardDescription className="text-[#3A5A40]">Events scheduled very recently</CardDescription>
                    </div>
                    <Link href={`/orgs/${orgId}/events`}>
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
                                            <span>{format(new Date(event.startDate), "dd MMMM yyyy")} - {format(new Date(event.endDate), "dd MMMM yyyy")}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 text-sm text-[#3A5A40]">
                                    <div className="flex items-center space-x-1">
                                        <MapPin className="h-4 w-4" />
                                        <span>{event.location}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Users className="h-4 w-4" />
                                        <span>{event.capacity || 'NA'} capacity</span>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Badge className={cn('capitalize', getStatusColor(event.status))}>{event.status}</Badge>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
