import { getMyPermissions, queryKeys } from "@/lib/api";
import { useClientQuery } from "@/hooks/use-client-query";

export function useMyPermissions(enabled = true) {
  return useClientQuery({
    queryKey: queryKeys.permissions.me(),
    queryFn: () => getMyPermissions(),
    enabled,
  });
}
