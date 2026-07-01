import { getIssue, queryKeys } from "@/lib/api";
import { useClientQuery } from "@/hooks/use-client-query";

export function useIssue(projectId: string, issueId: string | null) {
  return useClientQuery({
    queryKey: queryKeys.issues.detail(projectId, issueId ?? ""),
    queryFn: () => getIssue(projectId, issueId!),
    enabled: Boolean(projectId && issueId),
  });
}
