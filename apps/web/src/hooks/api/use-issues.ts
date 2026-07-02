import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createIssue,
  deleteIssue,
  listIssues,
  queryKeys,
  updateIssue,
} from "@/lib/api";
import type {
  CreateIssueInput,
  IssueWithStatus,
  ListIssuesParams,
  UpdateIssueInput,
} from "@/lib/api";
import { useClientQuery } from "@/hooks/use-client-query";

export type { IssueWithStatus };

const DEFAULT_ISSUE_LIST_PARAMS: ListIssuesParams = {
  page: 1,
  pageSize: 8,
};

export function useIssues(projectId: string, params?: ListIssuesParams) {
  const queryParams = params ?? DEFAULT_ISSUE_LIST_PARAMS;

  return useClientQuery({
    queryKey: queryKeys.issues.list(projectId, queryParams),
    queryFn: () => listIssues(projectId, queryParams),
    enabled: Boolean(projectId),
  });
}

export function useCreateIssue(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateIssueInput) => createIssue(projectId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.issues.all(projectId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.organizations.dashboard(),
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
        queryKey: queryKeys.issues.all(projectId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.organizations.dashboard(),
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
        queryKey: queryKeys.issues.all(projectId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.organizations.dashboard(),
      });
    },
  });
}
