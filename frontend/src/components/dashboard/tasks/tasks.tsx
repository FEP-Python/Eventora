"use client";
import { useState, useMemo } from "react";
import { Filter, Plus, Search, Calendar, Users, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

import { ListView } from "./list-view";
import { CreateTaskModal } from "./create-task-modal";
import { useOrgId } from "@/hooks/use-org-id";
import { useTasksByTeam } from "@/hooks/use-task";
import { useOrgTeams } from "@/hooks/use-team";
import { Task, TaskPriority, TaskStatus } from "@/type";

type FilterType = "all" | "pending" | "in_progress" | "completed" | "overdue";
type SortType = "dueDate" | "priority" | "status" | "title";

export const Tasks = () => {
    const orgId = useOrgId();
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState<FilterType>("all");
    const [sortBy, setSortBy] = useState<SortType>("dueDate");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

    // Get teams for the organization
    const { data: teams, isLoading: teamsLoading } = useOrgTeams(parseInt(orgId));

    // Get tasks for the selected team
    const { 
        data: tasks = [], 
        isLoading: tasksLoading, 
        error: tasksError,
        refetch: refetchTasks 
    } = useTasksByTeam(selectedTeamId || 0);

    // Filter and sort tasks
    const filteredAndSortedTasks = useMemo(() => {
        let filtered = tasks.filter((task: Task) => {
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
    }, [tasks, searchTerm, filter, sortBy]);

    // Get task statistics
    const taskStats = useMemo(() => {
        const total = tasks.length;
        const pending = tasks.filter((t: Task) => t.status === "pending").length;
        const inProgress = tasks.filter((t: Task) => t.status === "in_progress").length;
        const completed = tasks.filter((t: Task) => t.status === "completed").length;
        const overdue = tasks.filter((t: Task) => t.status === "overdue").length;

        return { total, pending, inProgress, completed, overdue };
    }, [tasks]);

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
                        No teams found. Create a team first to start managing tasks.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Tasks</h1>
                    <p className="text-gray-600">Manage and track your team&apos;s tasks</p>
                </div>
                <Button 
                    variant="green" 
                    className="flex items-center"
                    onClick={() => setShowCreateModal(true)}
                    disabled={!selectedTeamId}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                </Button>
            </div>

            {/* Team Selection */}
            <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Select Team
                </label>
                <Select value={selectedTeamId?.toString() || ""} onValueChange={(value) => setSelectedTeamId(parseInt(value))}>
                    <SelectTrigger className="w-64">
                        <SelectValue placeholder="Choose a team" />
                    </SelectTrigger>
                    <SelectContent>
                        {teams?.map((team) => (
                            <SelectItem key={team.id} value={team.id.toString()}>
                                {team.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Task Statistics */}
            {selectedTeamId && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total</p>
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

            {/* Tasks List */}
            {!selectedTeamId ? (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
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
                                : "Get started by creating your first task."
                            }
                        </p>
                        {!searchTerm && filter === "all" && (
                            <Button variant="green" onClick={() => setShowCreateModal(true)}>
                                <Plus className="h-4 w-4 mr-2" />
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
