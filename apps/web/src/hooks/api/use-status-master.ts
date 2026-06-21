import { useEffect } from "react";

import { getStatusMaster, queryKeys } from "@/lib/api";
import { useClientQuery } from "@/hooks/use-client-query";
import { useStatusStore } from "@/stores/use-status-store";

export function useLoadStatusMaster() {
  const setStatuses = useStatusStore((state) => state.setStatuses);
  const setLoading = useStatusStore((state) => state.setLoading);

  const query = useClientQuery({
    queryKey: queryKeys.organizations.statusMaster(),
    queryFn: getStatusMaster,
  });

  useEffect(() => {
    setLoading(query.isLoading);
  }, [query.isLoading, setLoading]);

  useEffect(() => {
    if (query.data) {
      setStatuses(query.data);
    }
  }, [query.data, setStatuses]);

  return query;
}
