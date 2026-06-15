import { useQuery } from "@tanstack/react-query";

import { listProjects, queryKeys } from "@/lib/api";

export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects.list(),
    queryFn: () => listProjects(),
  });
}
