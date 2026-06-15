import { useQuery } from "@tanstack/react-query";

import { getMemberPermissions, queryKeys } from "@/lib/api";

export function useMemberPermissions(userId: string | null, enabled = true) {
  return useQuery({
    queryKey: queryKeys.permissions.member(userId ?? ""),
    queryFn: () => getMemberPermissions(userId!),
    enabled: Boolean(userId) && enabled,
  });
}
