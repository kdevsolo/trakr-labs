"use client";

import { BellIcon, BotIcon, ClockIcon, LogOutIcon } from "lucide-react";

import { useMe } from "@/hooks/api/use-me";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { signOut } from "@/app/auth/actions";
import { redirect } from "next/navigation";

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

  const handleLogout = async () => {
    await signOut();
    redirect("/auth/login");
  };

  return (
    <header
      className={cn(
        "flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-[#f3f1fa] px-6",
        className,
      )}
    >
      <button
        type="button"
        className={cn(
          "ai-chat-mode-btn group relative flex items-center gap-2 overflow-hidden rounded-lg border border-border bg-white/60 px-3 py-2",
          "font-sans text-sm text-muted-foreground shadow-sm",
          "transition-[transform,box-shadow,border-color,color] duration-200 ease-out",
          "hover:border-primary/30 hover:text-primary hover:shadow-md",
          "active:scale-[0.97] active:shadow-sm active:duration-100",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        )}
      >
        <BotIcon className="relative z-10 size-4 transition-colors duration-200 group-hover:text-primary" />
        <span className="relative z-10 font-mono transition-colors duration-200 group-hover:text-primary">
          AI Chat Mode
        </span>
      </button>

      <div className="flex shrink-0 items-center gap-2">
        {/* <button
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
        </button> */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="cursor-pointer">
            <div className="ml-1 flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {initials ?? "?"}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleLogout} variant="destructive">
              <LogOutIcon className="size-4 cursor-pointer" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>
  );
};

export default TopNav;
