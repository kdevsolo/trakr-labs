import { useClientQuery } from "@/hooks/use-client-query";

import { listOrgMembers, queryKeys } from "@/lib/api";

export function useOrgMembers() {
  return useClientQuery({
    queryKey: queryKeys.users.members(),
    queryFn: () => listOrgMembers(),
  });
}
