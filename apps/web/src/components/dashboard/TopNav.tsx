"use client";

import { BellIcon, ClockIcon, SearchIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { useMe } from "@/hooks/api/use-me";
import { cn } from "@/lib/utils";

type TopNavProps = {
  className?: string;
};

const TopNav = ({ className }: TopNavProps) => {
  const { data: me } = useMe();
  const initials = me?.name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header
      className={cn(
        "flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-6",
        className,
      )}
    >
      <div className="relative mx-auto w-full max-w-xl">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search issues, projects, or users..."
          className="h-9 bg-muted/60 pl-9 text-sm"
        />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          className="relative flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Notifications"
        >
          <BellIcon className="size-4" />
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive" />
        </button>
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Activity history"
        >
          <ClockIcon className="size-4" />
        </button>
        <div className="ml-1 flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
          {initials ?? "?"}
        </div>
      </div>
    </header>
  );
};

export default TopNav;
