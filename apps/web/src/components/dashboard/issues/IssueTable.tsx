"use client";

import { useMemo } from "react";

import { TableFilter } from "@/components/shared/TableFilter";
import { TablePagination } from "@/components/shared/TablePagination";
import type { PaginationMeta } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useOrgMembersStore } from "@/stores/use-org-members-store";
import { useStatusStore } from "@/stores/use-status-store";

import { StatusBadge } from "./StatusBadge";
import type { IssueWithStatus } from "./types";

const ALL_FILTER = "all";
const UNASSIGNED_FILTER = "unassigned";

type IssueTableProps = {
  issues: IssueWithStatus[];
  meta: PaginationMeta;
  projectKey?: string;
  selectedIssueId: string | null;
  onSelectIssue: (issue: IssueWithStatus) => void;
  isLoading?: boolean;
  canCreateIssue?: boolean;
  onCreateIssue?: () => void;
  statusFilter: string;
  assigneeFilter: string;
  onStatusFilterChange: (value: string) => void;
  onAssigneeFilterChange: (value: string) => void;
  onPageChange: (page: number) => void;
};

const DATE_FORMAT = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : DATE_FORMAT.format(date);
}

function formatRelativeTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  }

  return formatDate(value);
}

function formatIssueKey(projectKey: string | undefined, issueId: string) {
  const prefix = (projectKey ?? "ISSUE").toUpperCase().slice(0, 6);
  const suffix = issueId.replace(/-/g, "").slice(-3).toUpperCase() || "001";
  return `${prefix}-${suffix}`;
}

export function IssueTable({
  issues,
  meta,
  projectKey,
  selectedIssueId,
  onSelectIssue,
  isLoading = false,
  canCreateIssue = false,
  onCreateIssue,
  statusFilter,
  assigneeFilter,
  onStatusFilterChange,
  onAssigneeFilterChange,
  onPageChange,
}: IssueTableProps) {
  const activeStatuses = useStatusStore((state) => state.activeStatuses);
  const members = useOrgMembersStore((state) => state.members);

  const statusOptions = useMemo(
    () => [
      { value: ALL_FILTER, label: "All" },
      ...activeStatuses.map((status) => ({
        value: status.id,
        label: status.title,
      })),
    ],
    [activeStatuses],
  );

  const assigneeOptions = useMemo(
    () => [
      { value: ALL_FILTER, label: "All" },
      { value: UNASSIGNED_FILTER, label: "Unassigned" },
      ...[...members]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((member) => ({ value: member.id, label: member.name })),
    ],
    [members],
  );

  const totalPages = Math.max(1, Math.ceil(meta.total / meta.pageSize));
  const rangeStart =
    meta.total === 0 ? 0 : (meta.page - 1) * meta.pageSize + 1;
  const rangeEnd = Math.min(meta.page * meta.pageSize, meta.total);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-lg border border-border bg-white">
        <p className="text-sm text-muted-foreground">Loading issues…</p>
      </div>
    );
  }

  if (meta.total === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border bg-white">
        <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
          <TableFilter
            label="Status"
            value={statusFilter}
            options={statusOptions}
            onChange={onStatusFilterChange}
          />
          <TableFilter
            label="Assignee"
            value={assigneeFilter}
            options={assigneeOptions}
            onChange={onAssigneeFilterChange}
          />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-2">
          <p className="text-sm text-muted-foreground">
            No issues found for this project.
          </p>
          {canCreateIssue && onCreateIssue ? (
            <button
              type="button"
              onClick={onCreateIssue}
              className="text-sm font-medium text-primary hover:underline"
            >
              Create issue
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border bg-white">
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
        <TableFilter
          label="Status"
          value={statusFilter}
          options={statusOptions}
          onChange={onStatusFilterChange}
        />
        <TableFilter
          label="Assignee"
          value={assigneeFilter}
          options={assigneeOptions}
          onChange={onAssigneeFilterChange}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="sticky top-0 z-10 bg-white">
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Key
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Summary
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Assignee
              </th>
            </tr>
          </thead>
          <tbody>
            {issues.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-12 text-center text-sm text-muted-foreground"
                >
                  No issues on this page.
                </td>
              </tr>
            ) : (
              issues.map((issue) => (
                <IssueRow
                  key={issue.id}
                  issue={issue}
                  issueKey={formatIssueKey(projectKey, issue.id)}
                  isSelected={selectedIssueId === issue.id}
                  onClick={() => onSelectIssue(issue)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <TablePagination
        page={meta.page}
        totalPages={totalPages}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        totalItems={meta.total}
        onPageChange={onPageChange}
        itemLabel="issue"
      />
    </div>
  );
}

type IssueRowProps = {
  issue: IssueWithStatus;
  issueKey: string;
  isSelected: boolean;
  onClick: () => void;
};

function IssueRow({ issue, issueKey, isSelected, onClick }: IssueRowProps) {
  const assignee =
    issue.assignee?.name ??
    (issue.assignedTo ? issue.assignedTo : "Unassigned");

  return (
    <tr
      onClick={onClick}
      className={cn(
        "cursor-pointer border-b border-border transition-colors hover:bg-muted/20",
        isSelected && "border-l-4 border-l-primary bg-primary/5 hover:bg-primary/5",
        !isSelected && "border-l-4 border-l-transparent",
      )}
    >
      <td className="px-4 py-3.5 font-mono text-xs font-medium text-muted-foreground">
        {issueKey}
      </td>
      <td className="max-w-md px-4 py-3.5">
        <p
          className={cn(
            "truncate font-medium text-foreground",
            isSelected && "text-primary",
          )}
        >
          {issue.title}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {issue.description ?? "No description"}
        </p>
      </td>
      <td className="px-4 py-3.5">
        <StatusBadge status={issue.status?.title ?? "Unknown"} />
      </td>
      <td className="px-4 py-3.5 text-muted-foreground">
        <span className={assignee === "Unassigned" ? "italic" : undefined}>
          {assignee}
        </span>
      </td>
    </tr>
  );
}

export { formatRelativeTime, formatIssueKey };
