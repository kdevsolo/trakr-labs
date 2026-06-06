import { Button } from "@/components/ui/button";

const BugVolumeChart = () => {
  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold text-foreground">
          Bug Volume (7-Day Trend)
        </h2>
        <Button variant="outline" size="sm" className="text-xs uppercase">
          Export
        </Button>
      </div>
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="flex h-48 w-full items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-sm text-muted-foreground">
          Line Chart Visualization Placeholder
        </div>
      </div>
    </div>
  );
};

export default BugVolumeChart;
