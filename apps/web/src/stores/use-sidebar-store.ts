import { create } from "zustand";

export type SidebarTab = "overview" | "issues" | "team" | "settings";

type SidebarState = {
  activeTab: SidebarTab;
  isCollapsed: boolean;
  setActiveTab: (tab: SidebarTab) => void;
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
};

export const useSidebarStore = create<SidebarState>((set) => ({
  activeTab: "overview",
  isCollapsed: false,
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleCollapsed: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
  setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
}));
