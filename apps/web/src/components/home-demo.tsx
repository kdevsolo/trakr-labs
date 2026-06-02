"use client";

import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { fetchHealth } from "@/lib/api";
import { useAppStore } from "@/stores/use-app-store";

export function HomeDemo() {
  const { count, increment, reset } = useAppStore();
  const healthQuery = useQuery({
    queryKey: ["health"],
    queryFn: fetchHealth,
  });

  return (
    <div className="flex w-full max-w-xl flex-col gap-6 rounded-xl border bg-card p-8 text-card-foreground shadow-sm">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Trakr Labs</h1>
        <p className="text-sm text-muted-foreground">
          Monorepo starter with Next.js, NestJS, Prisma, shadcn/ui, Zustand,
          and React Query.
        </p>
      </div>

      <div className="space-y-3 rounded-lg border bg-muted/40 p-4">
        <p className="text-sm font-medium">Zustand counter</p>
        <p className="text-3xl font-bold tabular-nums">{count}</p>
        <div className="flex gap-2">
          <Button onClick={increment}>Increment</Button>
          <Button variant="outline" onClick={reset}>
            Reset
          </Button>
        </div>
      </div>

      <div className="space-y-3 rounded-lg border bg-muted/40 p-4">
        <p className="text-sm font-medium">React Query — API health</p>
        {healthQuery.isLoading && (
          <p className="text-sm text-muted-foreground">Checking API...</p>
        )}
        {healthQuery.isError && (
          <p className="text-sm text-destructive">
            API unreachable. Start the backend with{" "}
            <code className="rounded bg-muted px-1 py-0.5">pnpm dev</code>.
          </p>
        )}
        {healthQuery.data && (
          <pre className="overflow-x-auto rounded-md bg-background p-3 text-xs">
            {JSON.stringify(healthQuery.data, null, 2)}
          </pre>
        )}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => healthQuery.refetch()}
          disabled={healthQuery.isFetching}
        >
          {healthQuery.isFetching ? "Refreshing..." : "Refresh"}
        </Button>
      </div>
    </div>
  );
}
