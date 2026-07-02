import Link from "next/link";

import { cn } from "@/lib/utils";

type DashboardWidgetShellProps = {
  title: string;
  action?: {
    label: string;
    href: string;
  };
  loading?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
};

function WidgetSkeleton() {
  return (
    <div className="space-y-3 p-5">
      <div className="h-8 w-24 animate-pulse rounded bg-muted" />
      <div className="h-4 w-full animate-pulse rounded bg-muted" />
      <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
    </div>
  );
}

export function DashboardWidgetShell({
  title,
  action,
  loading,
  error,
  className,
  children,
}: DashboardWidgetShellProps) {
  return (
    <div
      className={cn(
        "flex min-h-[280px] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {action && (
          <Link
            href={action.href}
            className="text-xs font-medium text-primary hover:underline"
          >
            {action.label}
          </Link>
        )}
      </div>
      <div className="flex flex-1 flex-col">
        {loading ? (
          <WidgetSkeleton />
        ) : error ? (
          <div className="flex flex-1 items-center justify-center p-5">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
