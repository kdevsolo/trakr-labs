import Link from "next/link";
import { ArrowUpRightIcon, InboxIcon } from "lucide-react";

import { DashboardWidgetShell } from "./DashboardWidgetShell";

type OpenIssuesWidgetProps = {
  count: number;
  loading?: boolean;
  error?: string;
};

export function OpenIssuesWidget({
  count,
  loading,
  error,
}: OpenIssuesWidgetProps) {
  return (
    <DashboardWidgetShell
      title="Open Issues"
      action={{ label: "View All", href: "/dashboard/issues" }}
      loading={loading}
      error={error}
    >
      <Link
        href="/dashboard/issues"
        className="group relative flex flex-1 flex-col overflow-hidden p-5 transition-colors hover:bg-muted/30"
      >
        <InboxIcon
          aria-hidden
          strokeWidth={1}
          className="pointer-events-none absolute -right-7 -bottom-7 size-36 text-foreground/[0.04] transition-colors group-hover:text-foreground/[0.07]"
        />

        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <InboxIcon className="size-4" />
          </span>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Total Open
          </p>
        </div>

        <div className="flex flex-1 items-center">
          <p className="text-5xl font-semibold tracking-tight text-foreground tabular-nums">
            {count}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            Issues awaiting triage across all projects
          </p>
          <ArrowUpRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
        </div>
      </Link>
    </DashboardWidgetShell>
  );
}
