"use client";

import { useMemo } from "react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { UserIcon } from "lucide-react";

import { DataTable } from "@/components/shared/DataTable";
import { cn } from "@/lib/utils";

type IssueStatus = "OPEN" | "IN PROGRESS" | "IN REVIEW";

type CriticalIssue = {
  id: string;
  title: string;
  reporter: string;
  status: IssueStatus;
  assignee: string | null;
};

const MOCK_ISSUES: CriticalIssue[] = [
  {
    id: "BUG-8492",
    title: "Payment gateway timeout on checkout",
    reporter: "Sentry Alert",
    status: "OPEN",
    assignee: null,
  },
  {
    id: "BUG-8487",
    title: "NullReferenceException in PaymentGateway.cs",
    reporter: "E. Ripley",
    status: "IN PROGRESS",
    assignee: "E. Ripley",
  },
  {
    id: "BUG-8481",
    title: "Session token not refreshing after idle",
    reporter: "J. Doe",
    status: "IN REVIEW",
    assignee: "J. Doe",
  },
  {
    id: "BUG-8475",
    title: "Duplicate charge on subscription renewal",
    reporter: "Support Ticket",
    status: "OPEN",
    assignee: null,
  },
  {
    id: "BUG-8469",
    title: "Webhook delivery failures spike",
    reporter: "Monitoring",
    status: "IN PROGRESS",
    assignee: "E. Ripley",
  },
];

const STATUS_STYLES: Record<IssueStatus, string> = {
  OPEN: "bg-red-50 text-red-700 ring-red-200",
  "IN PROGRESS": "bg-orange-50 text-orange-700 ring-orange-200",
  "IN REVIEW": "bg-violet-50 text-violet-700 ring-violet-200",
};

function StatusBadge({ status }: { status: IssueStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
        STATUS_STYLES[status],
      )}
    >
      {status}
    </span>
  );
}

function AssigneeCell({ name }: { name: string | null }) {
  if (!name) {
    return (
      <span className="text-sm text-muted-foreground italic">Unassigned</span>
    );
  }

  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("");

  return (
    <div className="flex items-center gap-2">
      <div className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
        {initials || <UserIcon className="size-3" />}
      </div>
      <span className="text-sm text-foreground">{name}</span>
    </div>
  );
}

const RecentCriticalIssues = () => {
  const columnDefs = useMemo<ColDef<CriticalIssue>[]>(
    () => [
      {
        field: "id",
        headerName: "ID",
        maxWidth: 120,
        cellRenderer: (params: ICellRendererParams<CriticalIssue>) => (
          <button
            type="button"
            className="text-sm font-medium text-primary hover:underline"
          >
            {params.value}
          </button>
        ),
      },
      {
        field: "title",
        headerName: "Title",
        minWidth: 240,
        flex: 2,
      },
      {
        field: "reporter",
        headerName: "Reporter",
        maxWidth: 160,
      },
      {
        field: "status",
        headerName: "Status",
        maxWidth: 140,
        cellRenderer: (params: ICellRendererParams<CriticalIssue>) => (
          <StatusBadge status={params.value as IssueStatus} />
        ),
      },
      {
        field: "assignee",
        headerName: "Assignee",
        maxWidth: 180,
        cellRenderer: (params: ICellRendererParams<CriticalIssue>) => (
          <AssigneeCell name={params.value} />
        ),
      },
    ],
    [],
  );

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold text-foreground">
          Recent Critical Issues
        </h2>
        <button
          type="button"
          className="text-xs font-medium text-primary hover:underline"
        >
          View All
        </button>
      </div>
      <div className="p-1">
        <DataTable
          rowData={MOCK_ISSUES}
          columnDefs={columnDefs}
          height={280}
          gridOptions={{
            headerHeight: 40,
            rowHeight: 48,
          }}
        />
      </div>
    </div>
  );
};

export default RecentCriticalIssues;
