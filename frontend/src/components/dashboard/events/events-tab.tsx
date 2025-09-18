import { Calendar, Clock, Edit, Eye, MapPin, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Event } from "@/type";
import { useRouter } from "next/navigation";

interface EventsTabProps {
    events: Event[];
    searchTerm: string;
    setSearchTerm?: (term: string) => void;
}

export const EventsTab = ({ events, searchTerm }: EventsTabProps) => {
    const router = useRouter();
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

    const filteredEvents = events.filter(
        (event) =>
            event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    return (
        <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
                <TabsTrigger value="all">All Events</TabsTrigger>
                <TabsTrigger value="draft">Draft</TabsTrigger>
                <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
                <TabsTrigger value="planned">Planned</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
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
                                </div>

                                <div className="flex items-center space-x-2 mt-3">
                                    <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                                    <Badge variant="outline">{event.eventType}</Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {/* Event Details */}
                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="h-4 w-4" />
                                        <span>{new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <MapPin className="h-4 w-4" />
                                        <span>{event.location}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Users className="h-4 w-4" />
                                        <span>
                                            {event.capacity} capacity
                                        </span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex space-x-2 pt-2">
                                    <Button onClick={() => router.push(`/orgs/${event.orgId}/events/${event.id}`)} variant="outline" size="sm" className="flex-1 bg-transparent">
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

            <TabsContent value="draft">
                {filteredEvents.filter(event => event.status === 'draft').length === 0 ? (
                    <div className="text-center py-12">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Draft Events</h3>
                        <p className="text-gray-600">Events which are in draft will appear here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredEvents.filter(event => event.status === 'draft').map((event) => (
                            <Card key={event.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg mb-2">{event.title}</CardTitle>
                                            <CardDescription className="text-sm">{event.description}</CardDescription>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2 mt-3">
                                        <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                                        <Badge variant="outline">{event.eventType}</Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {/* Event Details */}
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="h-4 w-4" />
                                            <span>{new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <MapPin className="h-4 w-4" />
                                            <span>{event.location}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Users className="h-4 w-4" />
                                            <span>
                                                {event.capacity} capacity
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex space-x-2 pt-2">
                                        <Button onClick={() => router.push(`/orgs/${event.orgId}/events/${event.id}`)} variant="outline" size="sm" className="flex-1 bg-transparent">
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
                )}
            </TabsContent>

            <TabsContent value="ongoing">
                {filteredEvents.filter(event => event.status === 'ongoing').length === 0 ? (
                    <div className="text-center py-12">
                        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Events Ongoing</h3>
                        <p className="text-gray-600">Events ongoing will appear here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredEvents.filter(event => event.status === 'ongoing').map((event) => (
                            <Card key={event.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg mb-2">{event.title}</CardTitle>
                                            <CardDescription className="text-sm">{event.description}</CardDescription>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2 mt-3">
                                        <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                                        <Badge variant="outline">{event.eventType}</Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {/* Event Details */}
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="h-4 w-4" />
                                            <span>{new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <MapPin className="h-4 w-4" />
                                            <span>{event.location}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Users className="h-4 w-4" />
                                            <span>
                                                {event.capacity} capacity
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex space-x-2 pt-2">
                                        <Button onClick={() => router.push(`/orgs/${event.orgId}/events/${event.id}`)} variant="outline" size="sm" className="flex-1 bg-transparent">
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
                )}
            </TabsContent>

            <TabsContent value="planned">
                {filteredEvents.filter(event => event.status === 'planned').length === 0 ? (
                    <div className="text-center py-12">
                        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Events Planned</h3>
                        <p className="text-gray-600">Events which are planned for future will appear here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredEvents.filter(event => event.status === 'planned').map((event) => (
                            <Card key={event.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg mb-2">{event.title}</CardTitle>
                                            <CardDescription className="text-sm">{event.description}</CardDescription>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2 mt-3">
                                        <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                                        <Badge variant="outline">{event.eventType}</Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {/* Event Details */}
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="h-4 w-4" />
                                            <span>{new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <MapPin className="h-4 w-4" />
                                            <span>{event.location}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Users className="h-4 w-4" />
                                            <span>
                                                {event.capacity} capacity
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex space-x-2 pt-2">
                                        <Button onClick={() => router.push(`/orgs/${event.orgId}/events/${event.id}`)} variant="outline" size="sm" className="flex-1 bg-transparent">
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
                )}
            </TabsContent>

            <TabsContent value="completed">
                {filteredEvents.filter(event => event.status === 'completed').length === 0 ? (
                    <div className="text-center py-12">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Completed Events</h3>
                        <p className="text-gray-600">Past events will appear here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredEvents.filter(event => event.status === 'completed').map((event) => (
                            <Card key={event.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg mb-2">{event.title}</CardTitle>
                                            <CardDescription className="text-sm">{event.description}</CardDescription>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2 mt-3">
                                        <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                                        <Badge variant="outline">{event.eventType}</Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {/* Event Details */}
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="h-4 w-4" />
                                            <span>{new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <MapPin className="h-4 w-4" />
                                            <span>{event.location}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Users className="h-4 w-4" />
                                            <span>
                                                {event.capacity} capacity
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex space-x-2 pt-2">
                                        <Button onClick={() => router.push(`/orgs/${event.orgId}/events/${event.id}`)} variant="outline" size="sm" className="flex-1 bg-transparent">
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
                )}
            </TabsContent>

            <TabsContent value="cancelled">
                {filteredEvents.filter(event => event.status === 'cancelled').length === 0 ? (
                    <div className="text-center py-12">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Cancelled Events</h3>
                        <p className="text-gray-600">Events which are cancelled will appear here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredEvents.filter(event => event.status === 'cancelled').map((event) => (
                            <Card key={event.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg mb-2">{event.title}</CardTitle>
                                            <CardDescription className="text-sm">{event.description}</CardDescription>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2 mt-3">
                                        <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                                        <Badge variant="outline">{event.eventType}</Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {/* Event Details */}
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="h-4 w-4" />
                                            <span>{new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <MapPin className="h-4 w-4" />
                                            <span>{event.location}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Users className="h-4 w-4" />
                                            <span>
                                                {event.capacity} capacity
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex space-x-2 pt-2">
                                        <Button onClick={() => router.push(`/orgs/${event.orgId}/events/${event.id}`)} variant="outline" size="sm" className="flex-1 bg-transparent">
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
                )}
            </TabsContent>
        </Tabs>
    );
}
