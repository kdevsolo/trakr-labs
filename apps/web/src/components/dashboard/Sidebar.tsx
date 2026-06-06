"use client";

import {
  BookOpenIcon,
  BugIcon,
  LayoutGridIcon,
  LifeBuoyIcon,
  PlusIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useSidebarStore,
  type SidebarTab,
} from "@/stores/use-sidebar-store";

import {
  getTabFromPathname,
  SIDEBAR_TAB_ROUTES,
} from "./sidebar-routes";

type NavItem = {
  id: SidebarTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Overview", icon: LayoutGridIcon },
  { id: "issues", label: "Issues", icon: BugIcon },
  { id: "team", label: "Team", icon: UsersIcon },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

const Sidebar = () => {
  const pathname = usePathname();
  const { activeTab, setActiveTab } = useSidebarStore();
  const version = process.env.NEXT_PUBLIC_APP_VERSION;

  useEffect(() => {
    setActiveTab(getTabFromPathname(pathname));
  }, [pathname, setActiveTab]);

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-border bg-[#f3f1fa]">
      <div className="px-5 pt-3 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BugIcon className="size-4" />
          </div>
          <div>
            <p className="text-sm font-semibold font-mono text-foreground">Trakr Labs</p>
            <p className="text-[11px] font-mono text-muted-foreground">{version}</p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <Button className="w-full gap-2 shadow-sm" size="default">
          <PlusIcon className="size-4" />
          New Issue
        </Button>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-3">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;

          return (
            <Link
              key={id}
              href={SIDEBAR_TAB_ROUTES[id]}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-white text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-white/60 hover:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-border/60 px-3 py-4">
        <div className="flex flex-col gap-0.5">
          <button
            type="button"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/60 hover:text-foreground"
          >
            <BookOpenIcon className="size-4" />
            Documentation
          </button>
          <button
            type="button"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/60 hover:text-foreground"
          >
            <LifeBuoyIcon className="size-4" />
            Support
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
