import { getBatchMemberPermissions, queryKeys } from "@/lib/api";
import { useClientQuery } from "@/hooks/use-client-query";

export function useMembersPermissions(userIds: string[], enabled = true) {
  return useClientQuery({
    queryKey: queryKeys.permissions.membersBatch(userIds),
    queryFn: () => getBatchMemberPermissions(userIds),
    enabled: enabled && userIds.length > 0,
  });
}
