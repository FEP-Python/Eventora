"use client";

import { Event, OrgStatistics } from "@/type";
import { useQuery } from "@tanstack/react-query";
import { getAllEventsByOrg } from "./use-event";
import { getOrganizationStatistics } from "./use-org";

interface DashboardStats extends OrgStatistics {
  recentEvents: Event[];
}

export const useOrgDashboard = (orgId: number) => {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard", orgId],
    queryFn: async () => {
      // Call the API function directly, not the hook
      const statistics = await getOrganizationStatistics(orgId);

      // Fetch events separately (only if needed for recent events display)
      const events = await getAllEventsByOrg(orgId);

      // Sort events by creation date and get most recent
      const sortedEvents = [...events].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const recentEvents = sortedEvents.slice(0, 5);

      return {
        ...statistics,
        recentEvents,
      };
    },
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
};

/**
 * Lightweight dashboard hook that only fetches statistics
 * Use this if you don't need recent events
 */
export const useOrgDashboardStats = (orgId: number) => {
  return useQuery({
    queryKey: ["org-statistics", orgId],
    queryFn: () => getOrganizationStatistics(orgId),
    enabled: !!orgId,
    staleTime: 10 * 60 * 1000,
  });
};
