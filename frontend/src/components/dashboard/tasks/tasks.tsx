"use client";
import { useState, useMemo, useEffect } from "react";
import { Plus, Search, Calendar, Users, AlertCircle, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

import { ListView } from "./list-view";
import { CreateTaskModal } from "./create-task-modal";
import { useOrgId } from "@/hooks/use-org-id";
import { useTasksByTeam } from "@/hooks/use-task";
import { useOrgTeams, useTeamMembers } from "@/hooks/use-team";
import { Task, TeamMember } from "@/type";
import { useCurrentUser } from "@/hooks/use-auth";
import { useOrgMembers } from "@/hooks/use-org";

type FilterType = "all" | "pending" | "in_progress" | "completed" | "overdue";
type SortType = "dueDate" | "priority" | "status" | "title";

export const Tasks = () => {
    const orgId = useOrgId();
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState<FilterType>("all");
    const [sortBy, setSortBy] = useState<SortType>("dueDate");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

    const { data: currentUser } = useCurrentUser();
    const { data: orgMembers } = useOrgMembers(Number(orgId));
    const { data: teamMembers } = useTeamMembers(selectedTeamId || 0);
    const { data: teams, isLoading: teamsLoading } = useOrgTeams(parseInt(orgId));


    // Get current user's organization role
    const currentUserOrgMember = orgMembers?.find((member) => member.id === currentUser?.id);
    const currentUserOrgRole = currentUserOrgMember?.orgRole;
    const isOrgAdmin = currentUserOrgRole === "leader" || currentUserOrgRole === "coleader";

    // Get current user's team role for selected team
    const currentUserTeamMember = teamMembers?.find((member) => member.id === currentUser?.id);
    const currentUserTeamRole = currentUserTeamMember?.teamRole;
    const isTeamAdmin = currentUserTeamRole === "leader" || currentUserTeamRole === "coleader";

    // Determine if user can create tasks
    const canCreateTask = isOrgAdmin || isTeamAdmin;

    // Get tasks for the selected team
    const {
        data: tasks = [],
        isLoading: tasksLoading,
        error: tasksError,
        refetch: refetchTasks
    } = useTasksByTeam(selectedTeamId || 0);

    useEffect(() => {
        refetchTasks();
    }, [refetchTasks, tasks]);

    // Filter tasks based on user role and permissions
    const visibleTasks = useMemo(() => {
        if (!currentUser) return [];

        // Org admins (leader/coleader) can see all tasks
        if (isOrgAdmin) {
            return tasks;
        }

        // Team admins (leader/coleader) can see all tasks in their team
        if (isTeamAdmin) {
            return tasks;
        }

        // Regular members can only see tasks assigned to them
        return tasks.filter((task: Task) => {
            return task.assignees?.some(u => u.id === currentUser.id);
        });
    }, [tasks, currentUser, isOrgAdmin, isTeamAdmin]);

    // Filter teams based on whether user is a member or org leader
    const filteredTeams = useMemo(() => {
        if (!teams || !currentUser) return [];

        // Org leaders can see all teams
        if (isOrgAdmin) return teams;

        // Otherwise, only show teams where current user is a member
        return teams.filter(team =>
            team.members?.some((member: TeamMember) => member.id === currentUser.id)
        );
    }, [teams, currentUser, isOrgAdmin]);


    // Filter and sort visible tasks
    const filteredAndSortedTasks = useMemo(() => {
        const filtered = visibleTasks.filter((task: Task) => {
            const matchesSearch =
                task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.description?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesFilter = filter === "all" || task.status === filter;

            return matchesSearch && matchesFilter;
        });

        // Sort tasks
        filtered.sort((a: Task, b: Task) => {
            switch (sortBy) {
                case "dueDate":
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                case "priority":
                    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                    return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) -
                        (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
                case "status":
                    const statusOrder = { pending: 1, in_progress: 2, completed: 3, overdue: 4 };
                    return (statusOrder[a.status as keyof typeof statusOrder] || 0) -
                        (statusOrder[b.status as keyof typeof statusOrder] || 0);
                case "title":
                    return a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        });

        return filtered;
    }, [visibleTasks, searchTerm, filter, sortBy]);

    // Get task statistics based on visible tasks
    const taskStats = useMemo(() => {
        const total = visibleTasks.length;
        const pending = visibleTasks.filter((t: Task) => t.status === "pending").length;
        const inProgress = visibleTasks.filter((t: Task) => t.status === "in_progress").length;
        const completed = visibleTasks.filter((t: Task) => t.status === "completed").length;
        const overdue = visibleTasks.filter((t: Task) => t.status === "overdue").length;

        return { total, pending, inProgress, completed, overdue };
    }, [visibleTasks]);

    // Get user's access level description
    const getAccessLevelBadge = () => {
        if (isOrgAdmin) {
            return (
                <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                    <ShieldCheck className="h-3 w-3" />
                    Club Leader / CoLeader - Full Access
                </Badge>
            );
        }
        if (isTeamAdmin) {
            return (
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    Team Admin - Team Tasks
                </Badge>
            );
        }
        return (
            <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                <Users className="h-3 w-3 mr-1" />
                Member - My Tasks Only
            </Badge>
        );
    };

    if (teamsLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Skeleton className="h-8 w-32 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <Skeleton className="h-10 w-24" />
                </div>
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    if (!teams || teams.length === 0) {
        return (
            <div>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tasks</h1>
                        <p className="text-gray-600">Manage and track your team&apos;s tasks</p>
                    </div>
                </div>
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        No teams found.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (filteredTeams.length === 0 && !isOrgAdmin && !isTeamAdmin) {
        return (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    You’re not part of any team yet. Please ask your team leader to add you.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Tasks</h1>
                    <p className="text-gray-600">Manage and track tasks</p>
                    <div className="mt-2">
                        {getAccessLevelBadge()}
                    </div>
                </div>
                {canCreateTask && (
                    <Button
                        variant="green"
                        className="flex items-center"
                        onClick={() => setShowCreateModal(true)}
                        disabled={!selectedTeamId}
                    >
                        <Plus className="h-4 w-4" />
                        Add Task
                    </Button>
                )}
            </div>

            {/* Team Selection */}
            {!selectedTeamId && (
                <div className="mb-6">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Select Team
                    </label>
                    <Select value={selectedTeamId?.toString() || ""} onValueChange={(value) => setSelectedTeamId(parseInt(value))}>
                        <SelectTrigger className="w-64">
                            <SelectValue placeholder="Choose a team" />
                        </SelectTrigger>
                        <SelectContent>
                            {filteredTeams?.map((team) => (
                                <SelectItem key={team.id} value={team.id.toString()}>
                                    <div className="flex items-center justify-between w-full">
                                        <span>{team.name}</span>
                                        {team.leaderId === currentUser?.id && (
                                            <Badge variant="outline" className="ml-2 text-xs">Leader</Badge>
                                        )}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Access Level Info */}
            {selectedTeamId && !isOrgAdmin && !isTeamAdmin && (
                <Alert className="mb-6 bg-blue-50 border-blue-200">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-900">
                        You are viewing tasks assigned to you. Team leaders can see all team tasks.
                    </AlertDescription>
                </Alert>
            )}

            {/* Task Statistics */}
            {selectedTeamId && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        {isOrgAdmin || isTeamAdmin ? "Total Tasks" : "My Tasks"}
                                    </p>
                                    <p className="text-2xl font-bold">{taskStats.total}</p>
                                </div>
                                <Users className="h-8 w-8 text-gray-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Pending</p>
                                    <p className="text-2xl font-bold text-yellow-600">{taskStats.pending}</p>
                                </div>
                                <AlertCircle className="h-8 w-8 text-yellow-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">In Progress</p>
                                    <p className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</p>
                                </div>
                                <Calendar className="h-8 w-8 text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Completed</p>
                                    <p className="text-2xl font-bold text-green-600">{taskStats.completed}</p>
                                </div>
                                <AlertCircle className="h-8 w-8 text-green-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Overdue</p>
                                    <p className="text-2xl font-bold text-red-600">{taskStats.overdue}</p>
                                </div>
                                <AlertCircle className="h-8 w-8 text-red-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters and Search */}
            {selectedTeamId && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
                    <div className="flex-1 max-w-md relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search tasks..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-[#f9fafb] focus:bg-white focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Select value={selectedTeamId?.toString() || ""} onValueChange={(value) => setSelectedTeamId(parseInt(value))}>
                            <SelectTrigger className="w-fit">
                                <SelectValue placeholder="Choose a team" />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredTeams?.map((team) => (
                                    <SelectItem key={team.id} value={team.id.toString()}>
                                        <div className="flex items-center justify-between w-full">
                                            <span>{team.name}</span>
                                            {team.leaderId === currentUser?.id && (
                                                <Badge variant="outline" className="ml-2 text-xs">Leader</Badge>
                                            )}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={filter} onValueChange={(value: FilterType) => setFilter(value)}>
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="overdue">Overdue</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={sortBy} onValueChange={(value: SortType) => setSortBy(value)}>
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="dueDate">Due Date</SelectItem>
                                <SelectItem value="priority">Priority</SelectItem>
                                <SelectItem value="status">Status</SelectItem>
                                <SelectItem value="title">Title</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}

            {/* Tasks List */}
            {!selectedTeamId ? (
                <Alert className="bg-[#588157]/10 max-w-lg">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-black">
                        Please select a team to view tasks.
                    </AlertDescription>
                </Alert>
            ) : tasksError ? (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Error loading tasks. Please try again.
                    </AlertDescription>
                </Alert>
            ) : tasksLoading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                    ))}
                </div>
            ) : filteredAndSortedTasks.length === 0 ? (
                <Card>
                    <CardContent className="p-8 text-center">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                        <p className="text-gray-600 mb-4">
                            {searchTerm || filter !== "all"
                                ? "No tasks match your current filters."
                                : !isOrgAdmin && !isTeamAdmin
                                    ? "You don't have any tasks assigned yet."
                                    : "Get started by creating your first task."
                            }
                        </p>
                        {!searchTerm && filter === "all" && canCreateTask && (
                            <Button variant="green" onClick={() => setShowCreateModal(true)}>
                                <Plus className="h-4 w-4" />
                                Create Task
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <ListView
                    tasks={filteredAndSortedTasks}
                    onTaskUpdate={refetchTasks}
                    onTaskDelete={refetchTasks}
                    isOrgAdmin={isOrgAdmin}
                    isTeamAdmin={isTeamAdmin}
                    currentUserId={currentUser?.id}
                />
            )}

            {/* Create Task Modal */}
            {showCreateModal && selectedTeamId && (
                <CreateTaskModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    teamId={selectedTeamId}
                    orgId={parseInt(orgId)}
                    onTaskCreated={refetchTasks}
                />
            )}
        </div>
    );
}
