import { Calendar, Clock, DollarSign, Edit, Eye, MapPin, MoreHorizontal, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Event = {
    id: number;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    attendees: number;
    maxAttendees: number;
    budget: number;
    spent: number;
    status: string;
    priority: string;
    category: string;
    organizer: string;
    subEvents: {
        name: string;
        time: string;
    }[];
}

interface EventsTabProps {
    events: Event[];
    searchTerm: string;
    setSearchTerm?: (term: string) => void;
}

export const EventsTab = ({ events, searchTerm }: EventsTabProps) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case "confirmed":
                return "bg-green-100 text-green-800"
            case "planning":
                return "bg-yellow-100 text-yellow-800"
            case "cancelled":
                return "bg-red-100 text-red-800"
            case "completed":
                return "bg-blue-100 text-blue-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high":
                return "bg-red-100 text-red-800"
            case "medium":
                return "bg-yellow-100 text-yellow-800"
            case "low":
                return "bg-green-100 text-green-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const filteredEvents = events.filter(
        (event) =>
            event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    return (
        <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
                <TabsTrigger value="all">All Events</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="planning">Planning</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredEvents.map((event) => (
                        <Card key={event.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg mb-2">{event.title}</CardTitle>
                                        <CardDescription className="text-sm">{event.description}</CardDescription>
                                    </div>
                                    <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="flex items-center space-x-2 mt-3">
                                    <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                                    <Badge className={getPriorityColor(event.priority)}>{event.priority}</Badge>
                                    <Badge variant="outline">{event.category}</Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {/* Event Details */}
                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="h-4 w-4" />
                                        <span>{new Date(event.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Clock className="h-4 w-4" />
                                        <span>{event.time}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <MapPin className="h-4 w-4" />
                                        <span>{event.location}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Users className="h-4 w-4" />
                                        <span>
                                            {event.attendees}/{event.maxAttendees} attendees
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <DollarSign className="h-4 w-4" />
                                        <span>
                                            ₹{event.spent.toLocaleString()}/₹{event.budget.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Sub Events */}
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Sub Events</h4>
                                    <div className="space-y-1">
                                        {event.subEvents.slice(0, 3).map((subEvent, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 p-2 rounded"
                                            >
                                                <span>{subEvent.name}</span>
                                                <span>{subEvent.time}</span>
                                            </div>
                                        ))}
                                        {event.subEvents.length > 3 && (
                                            <div className="text-xs text-gray-500 text-center py-1">
                                                +{event.subEvents.length - 3} more
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Organizer */}
                                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                                    <div className="text-sm text-gray-600">
                                        <span>Organized by </span>
                                        <span className="font-medium text-gray-900">{event.organizer}</span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex space-x-2 pt-2">
                                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                                        <Eye className="h-4 w-4 mr-1" />
                                        View
                                    </Button>
                                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                                        <Edit className="h-4 w-4 mr-1" />
                                        Edit
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </TabsContent>

            <TabsContent value="upcoming">
                <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Upcoming Events</h3>
                    <p className="text-gray-600">Events scheduled for the future will appear here.</p>
                </div>
            </TabsContent>

            <TabsContent value="planning">
                <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Events in Planning</h3>
                    <p className="text-gray-600">Events currently being planned will appear here.</p>
                </div>
            </TabsContent>

            <TabsContent value="completed">
                <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Completed Events</h3>
                    <p className="text-gray-600">Past events will appear here.</p>
                </div>
            </TabsContent>
        </Tabs>
    );
}
