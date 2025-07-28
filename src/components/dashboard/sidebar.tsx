import { CalendarDays } from "lucide-react";

// import { Button } from "@/components/ui/button";

import { Navigation } from "./navigation";
import { SidebarUserProfile } from "./sidebar-profile";


export const Sidebar = () => {
    return (
        <div className="flex flex-col w-64 bg-white/90 backdrop-blur-sm border-r border-[#A3B18A]/20">
            <div className="flex items-center justify-center h-16 px-4 border-b border-[#A3B18A]/20 gap-x-2">
                <CalendarDays className="h-9 w-9 text-[#3A5A40]" />
                <span className="text-2xl font-bold text-[#344E41]">Eventora</span>
            </div>

            {/* Organization Selector */}
            {/* <div className="p-4 border-b border-[#A3B18A]/20">
                <div className="relative">
                    <Button
                        variant="outline"
                        className="w-full justify-between bg-[#DAD7CD]/50 border-[#A3B18A]/30 hover:bg-[#A3B18A]/10 text-[#344E41]"
                        onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
                    >
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-[#588157] rounded-full"></div>
                            <span className="truncate">{activeOrg}</span>
                        </div>
                        <ChevronDown className="h-4 w-4" />
                    </Button>

                    {isOrgDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#A3B18A]/20 rounded-md shadow-lg z-10">
                            {organizations.map((org) => (
                                <button
                                    key={org.name}
                                    className="w-full px-3 py-2 text-left hover:bg-[#DAD7CD]/30 first:rounded-t-md last:rounded-b-md transition-colors"
                                    onClick={() => {
                                        setActiveOrg(org.name)
                                        setIsOrgDropdownOpen(false)
                                    }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-[#344E41]">{org.name}</p>
                                            <p className="text-xs text-[#3A5A40]">
                                                {org.role} • {org.members} members
                                            </p>
                                        </div>
                                        {org.name === activeOrg && <div className="w-2 h-2 bg-[#588157] rounded-full"></div>}
                                    </div>
                                </button>
                            ))}
                            <div className="border-t border-[#A3B18A]/20 p-2">
                                <Button variant="ghost" size="sm" className="w-full justify-start text-[#3A5A40] hover:bg-[#DAD7CD]/30">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Organization
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div> */}

            <Navigation />
            <SidebarUserProfile />
        </div>
    );
}
