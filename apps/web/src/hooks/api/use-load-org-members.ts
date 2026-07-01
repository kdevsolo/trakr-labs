import { useEffect } from "react";

import { listOrgMembers, queryKeys } from "@/lib/api";
import { useClientQuery } from "@/hooks/use-client-query";
import { useOrgMembersStore } from "@/stores/use-org-members-store";

const PAGE_SIZE = 100;

async function listAllOrgMembers() {
  const firstPage = await listOrgMembers({ page: 1, pageSize: PAGE_SIZE });
  const allItems = [...firstPage.items];
  const totalPages = Math.ceil(firstPage.meta.total / PAGE_SIZE);

  for (let page = 2; page <= totalPages; page += 1) {
    const nextPage = await listOrgMembers({ page, pageSize: PAGE_SIZE });
    allItems.push(...nextPage.items);
  }

  return allItems;
}

export function useLoadOrgMembers() {
  const setMembers = useOrgMembersStore((state) => state.setMembers);
  const setLoading = useOrgMembersStore((state) => state.setLoading);

  const query = useClientQuery({
    queryKey: [...queryKeys.users.membersPrefix(), "all"],
    queryFn: listAllOrgMembers,
  });

  useEffect(() => {
    setLoading(query.isLoading);
  }, [query.isLoading, setLoading]);

  useEffect(() => {
    if (query.data) {
      setMembers(query.data);
    }
  }, [query.data, setMembers]);

  return query;
}
