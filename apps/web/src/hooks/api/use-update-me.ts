import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys, updateMe } from "@/lib/api";
import type { UpdateProfileInput } from "@/lib/api";

export function useUpdateMe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => updateMe(input),
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.users.me(), user);
    },
  });
}
