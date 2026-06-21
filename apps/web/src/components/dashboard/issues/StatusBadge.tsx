import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  status: string;
  className?: string;
};

const STATUS_STYLES: Record<string, string> = {
  open: "border-red-200 bg-red-50 text-red-700",
  critical: "border-red-200 bg-red-50 text-red-700",
  "in progress": "border-amber-200 bg-amber-50 text-amber-700",
  high: "border-amber-200 bg-amber-50 text-amber-700",
  medium: "border-blue-200 bg-blue-50 text-blue-700",
  low: "border-slate-200 bg-slate-50 text-slate-600",
  closed: "border-slate-200 bg-slate-50 text-slate-600",
  done: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

function getStatusStyle(status: string) {
  return STATUS_STYLES[status.toLowerCase()] ?? "border-border bg-muted/60 text-foreground";
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold",
        getStatusStyle(status),
        className,
      )}
    >
      {status}
    </span>
  );
}
