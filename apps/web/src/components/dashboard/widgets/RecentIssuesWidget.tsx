import type { DashboardRecentIssue } from "@trakr/schemas";

import { DashboardWidgetShell } from "./DashboardWidgetShell";
import { IssueTile } from "./IssueTile";

type RecentIssuesWidgetProps = {
  issues: DashboardRecentIssue[];
  loading?: boolean;
  error?: string;
};

export function RecentIssuesWidget({
  issues,
  loading,
  error,
}: RecentIssuesWidgetProps) {
  return (
    <DashboardWidgetShell
      title="Recent Opened Issues"
      action={{ label: "View All", href: "/dashboard/issues" }}
      loading={loading}
      error={error}
    >
      {issues.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-5">
          <p className="text-sm text-muted-foreground">No issues yet</p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-5">
          {issues.map((issue) => (
            <IssueTile key={issue.id} issue={issue} />
          ))}
        </div>
      )}
    </DashboardWidgetShell>
  );
}
