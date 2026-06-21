import { useClientQuery } from "@/hooks/use-client-query";

import { listProjects, queryKeys } from "@/lib/api";

export function useProjects() {
  return useClientQuery({
    queryKey: queryKeys.projects.list(),
    queryFn: () => listProjects(),
  });
}
