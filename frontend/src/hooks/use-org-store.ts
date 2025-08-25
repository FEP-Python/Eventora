"use client";
import { Org } from "@/type";
import { create } from "zustand";


interface OrgState {
  activeOrg: Org | null;
  setActiveOrg: (org: Org) => void;
}

export const useOrgStore = create<OrgState>((set) => ({
  activeOrg: null,
  setActiveOrg: (org) => set({ activeOrg: org }),
}));
