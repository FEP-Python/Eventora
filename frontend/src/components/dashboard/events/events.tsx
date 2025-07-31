"use client";

import { useState } from "react";
import { Filter, Plus, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { EventsTab } from "./events-tab";


export const Events = () => {
    const [searchTerm, setSearchTerm] = useState("");

    const events = [
        {
            id: 1,
            title: "Tech Symposium 2024",
            description: "Annual technology conference featuring industry leaders",
            date: "2024-03-15",
            time: "9:00 AM - 6:00 PM",
            location: "Main Auditorium",
            attendees: 150,
            maxAttendees: 200,
            budget: 25000,
            spent: 18000,
            status: "confirmed",
            priority: "high",
            category: "Conference",
            organizer: "Sarah Chen",
            subEvents: [
                { name: "Opening Ceremony", time: "9:00 AM" },
                { name: "Keynote Speech", time: "10:00 AM" },
                { name: "Panel Discussion", time: "2:00 PM" },
                { name: "Networking Session", time: "5:00 PM" },
            ],
        },
        {
            id: 2,
            title: "Coding Workshop",
            description: "Hands-on programming workshop for beginners",
            date: "2024-03-18",
            time: "2:00 PM - 5:00 PM",
            location: "Computer Lab A",
            attendees: 45,
            maxAttendees: 50,
            budget: 5000,
            spent: 2000,
            status: "planning",
            priority: "medium",
            category: "Workshop",
            organizer: "Mike Johnson",
            subEvents: [
                { name: "Introduction to Programming", time: "2:00 PM" },
                { name: "Hands-on Coding", time: "3:00 PM" },
                { name: "Q&A Session", time: "4:30 PM" },
            ],
        },
        {
            id: 3,
            title: "Alumni Meetup",
            description: "Networking event with college alumni",
            date: "2024-03-22",
            time: "6:00 PM - 9:00 PM",
            location: "Conference Hall",
            attendees: 80,
            maxAttendees: 100,
            budget: 15000,
            spent: 8000,
            status: "confirmed",
            priority: "low",
            category: "Networking",
            organizer: "Lisa Wang",
            subEvents: [
                { name: "Welcome Reception", time: "6:00 PM" },
                { name: "Alumni Presentations", time: "7:00 PM" },
                { name: "Networking Dinner", time: "8:00 PM" },
            ],
        },
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Events</h1>
                    <p className="text-gray-600">Manage and organize your events</p>
                </div>
                <Button className="flex items-center" variant="green">
                    <Plus className="h-4 w-4" />
                    <span>Create Event</span>
                </Button>
            </div>

            <div className="flex items-center space-x-4 mb-6">
                <div className="flex-1 max-w-md relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search events..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-[#f9fafb] focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <Button className="flex items-center">
                    <Filter className="h-4 w-4" />
                    <span>Filter</span>
                </Button>
            </div>

            <EventsTab
                events={events}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
            />
        </div>
    );
}
