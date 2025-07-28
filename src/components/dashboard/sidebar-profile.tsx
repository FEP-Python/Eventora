import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export const SidebarUserProfile = () => {
    return (
        <div className="p-4 border-t border-[#A3B18A]/20">
            <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#588157] rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">VT</span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#344E41] truncate">Ved Tellawar</p>
                    <p className="text-xs text-[#3A5A40] truncate">ved@gmail.com</p>
                </div>
                <Button variant="ghost" size="sm" className="text-[#3A5A40] hover:bg-[#DAD7CD]/30">
                    <Bell className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
