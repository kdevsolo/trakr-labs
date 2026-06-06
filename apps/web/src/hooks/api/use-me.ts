import { useQuery } from "@tanstack/react-query";

import { getMe, queryKeys } from "@/lib/api";
import type { User } from "@/lib/api/types";

export function useMe() {
  return useQuery<User>({
    queryKey: queryKeys.users.me(),
    queryFn: () => getMe(),
  });
}
