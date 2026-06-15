import { useQuery } from "@tanstack/react-query";

import { listOrgMembers, queryKeys } from "@/lib/api";

export function useOrgMembers() {
  return useQuery({
    queryKey: queryKeys.users.members(),
    queryFn: () => listOrgMembers(),
  });
}
