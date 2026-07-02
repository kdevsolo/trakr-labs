"use client";

import { useDashboardSummary } from "@/hooks/api/use-dashboard";

import { AiInsightsWidget } from "./AiInsightsWidget";
import { CriticalTriageWidget } from "./CriticalTriageWidget";
import DashboardHeader from "./DashboardHeader";
import { OpenIssuesWidget } from "./OpenIssuesWidget";
import { RecentIssuesWidget } from "./RecentIssuesWidget";

const DashboardOverview = () => {
  const { data, isLoading, error } = useDashboardSummary();

  const errorMessage = error instanceof Error ? error.message : undefined;

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Dashboard Overview"
        subtitle="System status and issue triage metrics across your organization."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <OpenIssuesWidget
          count={data?.openIssuesCount ?? 0}
          loading={isLoading}
          error={errorMessage}
        />
        <CriticalTriageWidget
          count={data?.unassignedOpenCount ?? 0}
          loading={isLoading}
          error={errorMessage}
        />
        <RecentIssuesWidget
          issues={data?.recentIssues ?? []}
          loading={isLoading}
          error={errorMessage}
        />
        <AiInsightsWidget />
      </div>
    </div>
  );
};

export default DashboardOverview;
