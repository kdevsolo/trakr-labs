import { useQuery } from "@tanstack/react-query";

import { getHealth } from "@/lib/api/health";
import { queryKeys } from "@/lib/api/query-keys";
import type { HealthResponse } from "@/lib/api/types";

export function useHealth() {
  return useQuery<HealthResponse>({
    queryKey: queryKeys.health(),
    queryFn: getHealth,
  });
}
