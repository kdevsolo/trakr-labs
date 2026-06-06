import { Button } from "@/components/ui/button";

const AiInsights = () => {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="bg-primary px-5 py-3">
        <h2 className="text-sm font-semibold text-primary-foreground">
          AI Insights
        </h2>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Pattern Detected
          </p>
          <p className="text-sm leading-relaxed text-foreground">
            Spike in{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              NullReferenceExceptions
            </code>{" "}
            in{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              PaymentGateway.cs
            </code>
            .
          </p>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Recommendation
          </p>
          <p className="text-sm leading-relaxed text-foreground">
            Revert PR #482 or apply hotfix to null-check payment session
            handler.
          </p>
        </div>
        <Button variant="outline" size="sm" className="mt-auto w-full text-xs">
          View Detailed Logs
        </Button>
      </div>
    </div>
  );
};

export default AiInsights;
