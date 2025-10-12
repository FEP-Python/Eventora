"use client";

import { Event, Team, User } from "@/type";
import { useQuery } from "@tanstack/react-query";
import { getAllEventsByOrg } from "./use-event";
import { getAllTeamsByOrg } from "./use-team";
import { getOrganizationMembers } from "./use-org";

interface DashboardStats {
  totalEvents: number;
  totalMembers: number;
  totalTeams: number;
  recentEvents: Event[];
}

export const useOrgDashboard = (orgId: number) => {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard", orgId],
    queryFn: async () => {
      const [eventsRes, teamsRes, membersRes] = await Promise.all([
        getAllEventsByOrg(orgId),
        getAllTeamsByOrg(orgId),
        getOrganizationMembers(orgId),
      ]);

      const events: Event[] = eventsRes;
      const teams: Team[] = teamsRes;
      const members: User[] = membersRes;

      const sortedEvents = [...events].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const recentEvents = sortedEvents.slice(0, 5);

      return {
        totalEvents: events.length,
        totalTeams: teams.length,
        totalMembers: members.length,
        recentEvents,
      };
    },
  });
};
