import { useClientQuery } from "@/hooks/use-client-query";

import { getMemberPermissions, queryKeys } from "@/lib/api";

export function useMemberPermissions(userId: string | null, enabled = true) {
  return useClientQuery({
    queryKey: queryKeys.permissions.member(userId ?? ""),
    queryFn: () => getMemberPermissions(userId!),
    enabled: Boolean(userId) && enabled,
  });
}
