import { useMutation, useQueryClient } from "@tanstack/react-query";

import { inviteOrgMember, queryKeys } from "@/lib/api";
import type { InviteUserInput } from "@/lib/api/types";

export function useInviteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: InviteUserInput) => inviteOrgMember(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.membersPrefix() });
    },
  });
}
