import { Calendar, Crown, Mail, Shield, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { Team } from "./teams-grid";


interface AllMembersProps {
    teams: Team[];
}

export const AllMembers = ({ teams }: AllMembersProps) => {
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
        <div className="mt-12">
            <Card>
                <CardHeader>
                    <CardTitle>All Members</CardTitle>
                    <CardDescription>Complete directory of organization members</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {teams
                            .flatMap((team) => team.members)
                            .map((member) => {
                                const RoleIcon = getRoleIcon(member.role)
                                return (
                                    <div key={member.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start space-x-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={member.avatar || "/placeholder.svg"} />
                                                <AvatarFallback>{member.initials}</AvatarFallback>
                                            </Avatar>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h3 className="font-medium text-gray-900 truncate">{member.name}</h3>
                                                    <div
                                                        className={`w-2 h-2 rounded-full ${member.status === "active" ? "bg-green-500" : "bg-gray-400"
                                                            }`}
                                                    ></div>
                                                </div>

                                                <div className="space-y-1 mb-2">
                                                    <Badge className={`text-xs ${getRoleColor(member.role)}`}>
                                                        <RoleIcon className="h-3 w-3 mr-1" />
                                                        {member.role}
                                                    </Badge>
                                                </div>

                                                <div className="space-y-1 text-xs text-gray-600">
                                                    <div className="flex items-center space-x-1">
                                                        <Mail className="h-3 w-3" />
                                                        <span className="truncate">{member.email}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>Joined {new Date(member.joinDate).toLocaleDateString()}</span>
                                                    </div>
                                                </div>

                                                <div className="mt-2">
                                                    <div className="flex flex-wrap gap-1">
                                                        {member.skills.slice(0, 2).map((skill, index) => (
                                                            <Badge key={index} variant="outline" className="text-xs">
                                                                {skill}
                                                            </Badge>
                                                        ))}
                                                        {member.skills.length > 2 && (
                                                            <Badge variant="outline" className="text-xs">
                                                                +{member.skills.length - 2}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
