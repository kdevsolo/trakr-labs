import { listAllProjects, queryKeys } from "@/lib/api";
import { useClientQuery } from "@/hooks/use-client-query";

export function useProjects() {
  return useClientQuery({
    queryKey: queryKeys.projects.list(),
    queryFn: () => listAllProjects(),
  });
}
