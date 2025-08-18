'use client';

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useCurrentUser() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      queryClient.setQueryData(["currentUser"], JSON.parse(storedUser));
    }
  }, [queryClient]);

  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      // Normally you’d refetch from API if needed:
      // const res = await axios.get("/api/user/profile");
      // return res.data;
      const storedUser = localStorage.getItem("user");
      if (storedUser) return JSON.parse(storedUser);
      return null;
    },
    staleTime: Infinity,
  });
}
