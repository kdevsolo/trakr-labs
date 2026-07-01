import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createIssueComment,
  listIssueComments,
  queryKeys,
} from "@/lib/api";
import type { CreateCommentInput } from "@/lib/api";
import { useClientQuery } from "@/hooks/use-client-query";

export function useIssueComments(projectId: string, issueId: string) {
  return useClientQuery({
    queryKey: queryKeys.issues.comments(projectId, issueId),
    queryFn: async () => {
      const result = await listIssueComments(projectId, issueId, {
        page: 1,
        pageSize: 50,
      });
      return result.items;
    },
    enabled: Boolean(projectId && issueId),
  });
}

export function useCreateIssueComment(projectId: string, issueId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCommentInput) =>
      createIssueComment(projectId, issueId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.issues.comments(projectId, issueId),
      });
    },
  });
}
