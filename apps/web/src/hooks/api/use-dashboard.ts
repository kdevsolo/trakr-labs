import { getDashboardSummary, queryKeys } from "@/lib/api";
import type { DashboardSummaryParams } from "@/lib/api/dashboard";
import { useClientQuery } from "@/hooks/use-client-query";

const DEFAULT_PARAMS: DashboardSummaryParams = {
  recentLimit: 4,
};

export function useDashboardSummary(params?: DashboardSummaryParams) {
  const queryParams = params ?? DEFAULT_PARAMS;

  return useClientQuery({
    queryKey: queryKeys.organizations.dashboard(queryParams),
    queryFn: () => getDashboardSummary(queryParams),
  });
}
