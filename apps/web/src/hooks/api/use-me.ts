import { useClientQuery } from "@/hooks/use-client-query";

import { getMe, queryKeys } from "@/lib/api";
import type { User } from "@/lib/api/types";

export function useMe() {
  return useClientQuery<User>({
    queryKey: queryKeys.users.me(),
    queryFn: () => getMe(),
  });
}
