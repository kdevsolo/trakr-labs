"use client";

import { cn } from "@/lib/utils";

import { StatusBadge } from "./StatusBadge";
import type { IssueWithStatus } from "./types";

type IssueTableProps = {
  issues: IssueWithStatus[];
  selectedIssueId: string | null;
  onSelectIssue: (issue: IssueWithStatus) => void;
  isLoading?: boolean;
};

const DATE_FORMAT = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : DATE_FORMAT.format(date);
}

function truncate(value: string | null | undefined, maxLength = 60) {
  if (!value) return "—";
  return value.length > maxLength ? `${value.slice(0, maxLength)}…` : value;
}

export function IssueTable({
  issues,
  selectedIssueId,
  onSelectIssue,
  isLoading = false,
}: IssueTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-border bg-white py-16">
        <p className="text-sm text-muted-foreground">Loading issues…</p>
      </div>
    );
  }

  if (issues.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-border bg-white py-16">
        <p className="text-sm text-muted-foreground">
          No issues found for this project.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Title
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Description
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Reported By
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Assigned To
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Created
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Updated
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {issues.map((issue) => (
              <IssueRow
                key={issue.id}
                issue={issue}
                isSelected={selectedIssueId === issue.id}
                onClick={() => onSelectIssue(issue)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-border px-4 py-3">
        <p className="text-sm text-muted-foreground">
          Showing {issues.length} issue{issues.length === 1 ? "" : "s"}
        </p>
      </div>
    </div>
  );
}

type IssueRowProps = {
  issue: IssueWithStatus;
  isSelected: boolean;
  onClick: () => void;
};

function IssueRow({ issue, isSelected, onClick }: IssueRowProps) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        "cursor-pointer transition-colors hover:bg-muted/30",
        isSelected && "bg-primary/5 hover:bg-primary/5",
      )}
    >
      <td className="max-w-xs px-4 py-3.5">
        <span
          className={cn(
            "truncate font-medium text-foreground",
            isSelected && "text-primary",
          )}
        >
          {issue.title}
        </span>
      </td>
      <td className="max-w-sm px-4 py-3.5 text-muted-foreground">
        {truncate(issue.description)}
      </td>
      <td className="px-4 py-3.5">
        <StatusBadge status={issue.status?.title ?? "Unknown"} />
      </td>
      <td className="px-4 py-3.5 text-muted-foreground">
        {issue.reporter?.name ?? issue.reportedBy ?? "—"}
      </td>
      <td className="px-4 py-3.5 text-muted-foreground">
        {issue.assignee?.name ?? (issue.assignedTo ? issue.assignedTo : "Unassigned")}
      </td>
      <td className="px-4 py-3.5 text-muted-foreground">
        {formatDate(issue.createdAt)}
      </td>
      <td className="px-4 py-3.5 text-muted-foreground">
        {formatDate(issue.updatedAt)}
      </td>
    </tr>
  );
}
