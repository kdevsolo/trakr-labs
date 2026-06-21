import type { StatusMaster } from "@trakr/schemas";
import { create } from "zustand";

type StatusState = {
  statuses: StatusMaster[];
  activeStatuses: StatusMaster[];
  isLoading: boolean;
  setStatuses: (statuses: StatusMaster[]) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
};

export const useStatusStore = create<StatusState>((set) => ({
  statuses: [],
  activeStatuses: [],
  isLoading: false,
  setStatuses: (statuses) =>
    set({
      statuses,
      activeStatuses: statuses.filter((status) => status.active),
      isLoading: false,
    }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ statuses: [], activeStatuses: [], isLoading: false }),
}));
