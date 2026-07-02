import Link from "next/link";
import { ArrowUpRightIcon, ShieldAlertIcon } from "lucide-react";

import { DashboardWidgetShell } from "./DashboardWidgetShell";

type CriticalTriageWidgetProps = {
  count: number;
  loading?: boolean;
  error?: string;
};

export function CriticalTriageWidget({
  count,
  loading,
  error,
}: CriticalTriageWidgetProps) {
  const needsAttention = count > 0;

  return (
    <DashboardWidgetShell
      title="Critical Triage Needed"
      action={{ label: "View All", href: "/dashboard/issues" }}
      loading={loading}
      error={error}
    >
      <Link
        href="/dashboard/issues"
        className="group relative flex flex-1 flex-col overflow-hidden p-5 transition-colors hover:bg-destructive/[0.03]"
      >
        <ShieldAlertIcon
          aria-hidden
          strokeWidth={1}
          className="pointer-events-none absolute -right-7 -bottom-7 size-36 text-destructive/[0.05] transition-colors group-hover:text-destructive/[0.09]"
        />

        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <ShieldAlertIcon className="size-4" />
          </span>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Unassigned Open
          </p>
        </div>

        <div className="flex flex-1 items-center gap-3">
          <p className="text-5xl font-semibold tracking-tight text-foreground tabular-nums">
            {count}
          </p>
          {needsAttention && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-60" />
                <span className="relative inline-flex size-1.5 rounded-full bg-destructive" />
              </span>
              Needs attention
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            Open issues with no assignee
          </p>
          <ArrowUpRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-destructive" />
        </div>
      </Link>
    </DashboardWidgetShell>
  );
}
