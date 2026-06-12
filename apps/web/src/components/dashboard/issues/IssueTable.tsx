"use client";

import { cn } from "@/lib/utils";
import { SeverityBadge } from "./SeverityBadge";
import type { Issue } from "./types";

type IssueTableProps = {
  issues: Issue[];
  selectedIssueId: string | null;
  onSelectIssue: (issue: Issue) => void;
};

export function IssueTable({
  issues,
  selectedIssueId,
  onSelectIssue,
}: IssueTableProps) {
  return (
    <div className="rounded-lg border border-border bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Key
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Summary
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Component
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Severity
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

      <div className="flex items-center justify-between border-t border-border px-4 py-3">
        <p className="text-sm text-muted-foreground">
          Showing 1-{issues.length} of {issues.length} issues
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled
            className="flex size-8 items-center justify-center rounded-md border border-input text-sm text-muted-foreground hover:bg-accent disabled:opacity-40"
          >
            ‹
          </button>
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground"
          >
            1
          </button>
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-md border border-input text-sm text-muted-foreground hover:bg-accent"
          >
            2
          </button>
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-md border border-input text-sm text-muted-foreground hover:bg-accent"
          >
            3
          </button>
          <span className="px-1 text-sm text-muted-foreground">...</span>
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-md border border-input text-sm text-muted-foreground hover:bg-accent"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}

type IssueRowProps = {
  issue: Issue;
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
      <td className="px-4 py-3.5">
        <span className="font-mono text-xs font-semibold text-muted-foreground">
          {issue.key}
        </span>
      </td>
      <td className="max-w-xs px-4 py-3.5">
        <span
          className={cn(
            "truncate font-medium text-foreground",
            isSelected && "text-primary",
          )}
        >
          {issue.summary.length > 55
            ? `${issue.summary.slice(0, 55)}...`
            : issue.summary}
        </span>
      </td>
      <td className="px-4 py-3.5">
        <span className="text-muted-foreground">{issue.component}</span>
      </td>
      <td className="px-4 py-3.5">
        <SeverityBadge severity={issue.severity} />
      </td>
    </tr>
  );
}
