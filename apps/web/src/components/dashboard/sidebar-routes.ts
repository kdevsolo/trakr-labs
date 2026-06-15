import type { SidebarTab } from "@/stores/use-sidebar-store";

export const SIDEBAR_TAB_ROUTES: Record<SidebarTab, string> = {
  overview: "/dashboard",
  issues: "/dashboard/issues",
  team: "/dashboard/team",
  settings: "/dashboard/settings",
};

const PATH_TO_TAB = Object.entries(SIDEBAR_TAB_ROUTES).reduce(
  (acc, [tab, path]) => {
    acc[path] = tab as SidebarTab;
    return acc;
  },
  {} as Record<string, SidebarTab>,
);

export function getTabFromPathname(pathname: string): SidebarTab {
  return PATH_TO_TAB[pathname] ?? "overview";
}
