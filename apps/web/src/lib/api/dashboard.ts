import type { DashboardQuery, DashboardSummary } from "@trakr/schemas";

import { apiFetch } from "./client";
import { toSearchParams } from "./search-params";

export type DashboardSummaryParams = DashboardQuery;

export function getDashboardSummary(params?: DashboardSummaryParams) {
  return apiFetch<DashboardSummary>(
    `/organizations/dashboard${toSearchParams(params)}`,
  );
}
