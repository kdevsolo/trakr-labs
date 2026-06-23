import { create } from "zustand";

import type { User } from "@/lib/api/types";

type OrgMembersState = {
  members: User[];
  isLoading: boolean;
  setMembers: (members: User[]) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
};

export const useOrgMembersStore = create<OrgMembersState>((set) => ({
  members: [],
  isLoading: false,
  setMembers: (members) => set({ members, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ members: [], isLoading: false }),
}));
