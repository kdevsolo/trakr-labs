import Link from "next/link";

import { StatusBadge } from "@/components/dashboard/issues/StatusBadge";
import type { DashboardRecentIssue } from "@trakr/schemas";
import { cn } from "@/lib/utils";

function formatRelativeTime(isoDate: string) {
  const date = new Date(isoDate);
  const now = Date.now();
  const diffSeconds = Math.round((date.getTime() - now) / 1000);
  const absSeconds = Math.abs(diffSeconds);

  const formatter = new Intl.RelativeTimeFormat(undefined, {
    numeric: "auto",
  });

  if (absSeconds < 60) {
    return formatter.format(diffSeconds, "second");
  }

  const diffMinutes = Math.round(diffSeconds / 60);
  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, "hour");
  }

  const diffDays = Math.round(diffHours / 24);
  return formatter.format(diffDays, "day");
}

type IssueTileProps = {
  issue: DashboardRecentIssue;
};

export function IssueTile({ issue }: IssueTileProps) {
  const statusTitle = issue.status?.title ?? "Unknown";

  return (
    <Link
      href="/dashboard/issues"
      className={cn(
        "flex flex-col gap-2 rounded-lg border border-border bg-background p-3 transition-colors hover:bg-muted/40",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="line-clamp-2 text-sm font-medium text-foreground">
          {issue.title}
        </p>
        <StatusBadge status={statusTitle} className="shrink-0" />
      </div>
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="truncate">{issue.projectName}</span>
        <span className="shrink-0">{formatRelativeTime(issue.createdAt)}</span>
      </div>
      {!issue.assignee && (
        <span className="text-xs text-muted-foreground italic">Unassigned</span>
      )}
    </Link>
  );
}
