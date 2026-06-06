import { cn } from "@/lib/utils";

type StatsCardProps = {
  label: string;
  value: string;
  trend?: {
    value: string;
    positive?: boolean;
  };
  icon: React.ReactNode;
  accent?: "default" | "critical";
  className?: string;
};

const StatsCard = ({
  label,
  value,
  trend,
  icon,
  accent = "default",
  className,
}: StatsCardProps) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm",
        accent === "critical" && "border-l-4 border-l-destructive",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {label}
          </p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {trend && (
            <p
              className={cn(
                "text-xs font-medium",
                trend.positive ? "text-emerald-600" : "text-muted-foreground",
              )}
            >
              {trend.value}
            </p>
          )}
        </div>
        <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
