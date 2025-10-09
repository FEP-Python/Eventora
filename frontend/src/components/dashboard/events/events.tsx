"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { EventsTab } from "./events-tab";
import { useModalStore } from "@/hooks/use-modal-store";
import { useOrgEvents } from "@/hooks/use-event";
import { useParams } from "next/navigation";


export const Events = () => {
    const { orgId } = useParams<{ orgId: string }>();
    const { data: events } = useOrgEvents(Number(orgId));
    const openModal = useModalStore(state => state.openModal);
    const [searchTerm, setSearchTerm] = useState("");

    if(!events) {
        return (
            <div>
                No events found!
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Events</h1>
                    <p className="text-gray-600">Manage and organize your events</p>
                </div>
                <Button
                    onClick={() => openModal("createEvent")}
                    className="flex items-center"
                    variant="green"
                >
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
            </div>

            <EventsTab
                events={events}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
            />
        </div>
    );
}
