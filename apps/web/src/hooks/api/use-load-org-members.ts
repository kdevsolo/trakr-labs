import { useEffect } from "react";

import { listOrgMembers, queryKeys } from "@/lib/api";
import { useClientQuery } from "@/hooks/use-client-query";
import { useOrgMembersStore } from "@/stores/use-org-members-store";

const PRELOAD_PARAMS = { page: 1, pageSize: 100 };

export function useLoadOrgMembers() {
  const setMembers = useOrgMembersStore((state) => state.setMembers);
  const setLoading = useOrgMembersStore((state) => state.setLoading);

  const query = useClientQuery({
    queryKey: queryKeys.users.members(PRELOAD_PARAMS),
    queryFn: () => listOrgMembers(PRELOAD_PARAMS),
  });

  useEffect(() => {
    setLoading(query.isLoading);
  }, [query.isLoading, setLoading]);

  useEffect(() => {
    if (query.data) {
      setMembers(query.data.items);
    }
  }, [query.data, setMembers]);

  return query;
}
