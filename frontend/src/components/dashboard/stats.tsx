import { Card, CardContent } from "@/components/ui/card";
import { CheckSquare, DollarSign, Users, Calendar } from "lucide-react";


interface StatsGridProps {
    totalEvents: number;
    totalMembers: number;
    totalTeams: number;
}

export const StatsGrid = ({ totalEvents, totalMembers, totalTeams }: StatsGridProps) => {
    const stats = [
        {
            title: "Events",
            value: totalEvents,
            change: "Total Events",
            icon: Calendar,
            color: "text-[#588157]",
            bgColor: "bg-[#588157]/10",
        },
        {
            title: "Members",
            value: totalMembers,
            change: "Active members in club",
            icon: Users,
            color: "text-[#A3B18A]",
            bgColor: "bg-[#A3B18A]/10",
        },
        {
            title: "Teams",
            value: totalTeams,
            change: "Total teams in club",
            icon: CheckSquare,
            color: "text-[#3A5A40]",
            bgColor: "bg-[#3A5A40]/10",
        },
        {
            title: "Budget",
            value: "₹45,000",
            change: "Total budget of club",
            icon: DollarSign,
            color: "text-[#588157]",
            bgColor: "bg-[#588157]/10",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
                <Card
                    key={index}
                    className="bg-white/80 backdrop-blur-sm border-[#A3B18A]/20 hover:shadow-lg transition-all duration-200"
                >
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-[#3A5A40] mb-1">{stat.title}</p>
                                <p className="text-2xl font-bold text-[#344E41]">{stat.value}</p>
                                <p className="text-xs text-[#588157] mt-1">{stat.change}</p>
                            </div>
                            <div className={`p-3 rounded-full ${stat.bgColor} ${stat.color}`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>

    );
}
