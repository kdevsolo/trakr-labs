import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  status: string;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-border bg-muted/60 px-2 py-0.5 text-xs font-medium text-foreground",
        className,
      )}
    >
      {status}
    </span>
  );
}
