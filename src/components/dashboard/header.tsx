import { Calendar, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Header = () => {
    return (
        <header className="bg-white/90 backdrop-blur-sm border-b border-[#A3B18A]/20 px-6 py-4">
            <div className="flex items-center justify-between">
                {/* Search */}
                <div className="flex-1 max-w-md">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#588157]" />
                        <Input
                            placeholder="Search events, tasks, members..."
                            className="pl-10 border-[#A3B18A]/30 focus:border-[#588157] bg-[#DAD7CD]/20"
                        />
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center space-x-4">
                    <Button className="hidden md:flex bg-[#3A5A40] hover:bg-[#344E41] text-white">
                        <Plus className="h-4 w-4" />
                        New Event
                    </Button>

                    <Button
                        variant="outline"
                        className="hidden md:flex border-[#A3B18A]/30 text-[#3A5A40] hover:bg-[#A3B18A]/10 bg-transparent"
                    >
                        <Calendar className="h-4 w-4" />
                        Schedule
                    </Button>
                </div>
            </div>
        </header>
    );
}
