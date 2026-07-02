import { SparklesIcon } from "lucide-react";

export function AiInsightsWidget() {
  return (
    <div className="flex min-h-[280px] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="bg-primary px-5 py-3">
        <h2 className="text-sm font-semibold text-primary-foreground">
          AI Insights
        </h2>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-5 text-center">
        <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <SparklesIcon className="size-5" />
        </div>
        <p className="text-sm text-muted-foreground">AI insights coming soon</p>
      </div>
    </div>
  );
}
