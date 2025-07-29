import { Crown, MoreHorizontal, Settings, Shield, User, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"


export type Team = {
    id: number;
    name: string;
    description: string;
    members: {
        id: number;
        name: string;
        email: string;
        role: string;
        avatar: string;
        initials: string;
        joinDate: string;
        skills: string[];
        status: string;
    }[];
    color: string;
    activeProjects: number;
    completedTasks: number;
}

interface TeamsGridProps {
    teams: Team[];
}

export const TeamsGrid = ({ teams }: TeamsGridProps) => {
    const getRoleIcon = (role: string) => {
        switch (role.toLowerCase()) {
            case "team lead":
                return Crown
            case "coordinator":
                return Shield
            default:
                return User
        }
    }

    const getRoleColor = (role: string) => {
        switch (role.toLowerCase()) {
            case "team lead":
                return "bg-yellow-100 text-yellow-800"
            case "coordinator":
                return "bg-blue-100 text-blue-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {teams.map((team) => (
                <Card key={team.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                    <CardTitle className="text-lg">{team.name}</CardTitle>
                                    <Badge className={team.color}>{team.members.length} members</Badge>
                                </div>
                                <CardDescription className="text-sm">{team.description}</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {/* Team Stats */}
                        <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-gray-900">{team.activeProjects}</p>
                                <p className="text-xs text-gray-600">Active Projects</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-gray-900">{team.completedTasks}</p>
                                <p className="text-xs text-gray-600">Completed Tasks</p>
                            </div>
                        </div>

                        {/* Team Members */}
                        <div>
                            <h4 className="font-medium text-gray-900 mb-3">Team Members</h4>
                            <div className="space-y-3">
                                {team.members.slice(0, 4).map((member) => {
                                    const RoleIcon = getRoleIcon(member.role)
                                    return (
                                        <div
                                            key={member.id}
                                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={member.avatar || "/placeholder.svg"} />
                                                <AvatarFallback className="text-xs">{member.initials}</AvatarFallback>
                                            </Avatar>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                                                    <div
                                                        className={`w-2 h-2 rounded-full ${member.status === "active" ? "bg-green-500" : "bg-gray-400"
                                                            }`}
                                                    ></div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Badge className={`text-xs ${getRoleColor(member.role)}`}>
                                                        <RoleIcon className="h-3 w-3 mr-1" />
                                                        {member.role}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}

                                {team.members.length > 4 && (
                                    <div className="text-center py-2">
                                        <Button variant="ghost" size="sm" className="text-xs">
                                            +{team.members.length - 4} more members
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2 pt-2 border-t border-gray-200">
                            <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                                <Users className="h-4 w-4" />
                                View Team
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                                <Settings className="h-4 w-4" />
                                Manage
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
