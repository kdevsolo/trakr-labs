import { cn } from "@/lib/utils";

export function AuthFieldLabel({
  htmlFor,
  children,
  action,
  className,
}: {
  htmlFor: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-2", className)}>
      <label
        htmlFor={htmlFor}
        className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
      >
        {children}
      </label>
      {action}
    </div>
  );
}
