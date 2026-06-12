import { cn } from "@/lib/utils";
import type { Severity } from "./types";

const SEVERITY_CONFIG: Record<
  Severity,
  { label: string; className: string }
> = {
  critical: {
    label: "Critical",
    className: "bg-red-100 text-red-700 border-red-200",
  },
  high: {
    label: "High",
    className: "bg-orange-100 text-orange-700 border-orange-200",
  },
  medium: {
    label: "Medium",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  low: {
    label: "Low",
    className: "bg-green-100 text-green-700 border-green-200",
  },
};

type SeverityBadgeProps = {
  severity: Severity;
  className?: string;
};

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const config = SEVERITY_CONFIG[severity];
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
