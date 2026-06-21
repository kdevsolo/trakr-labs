import { useClientQuery } from "@/hooks/use-client-query";

import { getHealth } from "@/lib/api/health";
import { queryKeys } from "@/lib/api/query-keys";
import type { HealthResponse } from "@/lib/api/types";

export function useHealth() {
  return useClientQuery<HealthResponse>({
    queryKey: queryKeys.health(),
    queryFn: getHealth,
  });
}
