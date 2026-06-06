import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createIssue,
  deleteIssue,
  listIssues,
  queryKeys,
  updateIssue,
} from "@/lib/api";
import type { CreateIssueInput, UpdateIssueInput } from "@/lib/api";

export function useIssues(projectId: string) {
  return useQuery({
    queryKey: queryKeys.issues.list(projectId),
    queryFn: () => listIssues(projectId),
    enabled: Boolean(projectId),
  });
}

export function useCreateIssue(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateIssueInput) => createIssue(projectId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.issues.list(projectId),
      });
    },
  });
}

export function useUpdateIssue(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      issueId,
      input,
    }: {
      issueId: string;
      input: UpdateIssueInput;
    }) => updateIssue(projectId, issueId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.issues.list(projectId),
      });
    },
  });
}

export function useDeleteIssue(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (issueId: string) => deleteIssue(projectId, issueId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.issues.list(projectId),
      });
    },
  });
}
