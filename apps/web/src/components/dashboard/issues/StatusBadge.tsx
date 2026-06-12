import { cn } from "@/lib/utils";
import type { IssueStatus } from "./types";

const STATUS_CONFIG: Record<
  IssueStatus,
  { label: string; className: string }
> = {
  open: {
    label: "Open",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-purple-100 text-purple-700 border-purple-200",
  },
  resolved: {
    label: "Resolved",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  closed: {
    label: "Closed",
    className: "bg-gray-100 text-gray-600 border-gray-200",
  },
};

type StatusBadgeProps = {
  status: IssueStatus;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
