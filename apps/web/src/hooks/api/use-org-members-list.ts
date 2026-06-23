import { listOrgMembers, queryKeys } from "@/lib/api";
import type { PaginationQuery } from "@/lib/api";
import { useClientQuery } from "@/hooks/use-client-query";

export function useOrgMembersList(params: PaginationQuery) {
  return useClientQuery({
    queryKey: queryKeys.users.members(params),
    queryFn: () => listOrgMembers(params),
  });
}
