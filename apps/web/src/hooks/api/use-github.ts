"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  getAvailableRepos,
  getGithubConnection,
  getInstallUrl,
  linkRepo,
  queryKeys,
  unlinkRepo,
} from "@/lib/api";
import type { LinkRepoInput } from "@trakr/schemas";
import { useClientQuery } from "@/hooks/use-client-query";

export function useGithubConnection(projectId: string) {
  return useClientQuery({
    queryKey: queryKeys.github.connection(projectId),
    queryFn: () => getGithubConnection(projectId),
    enabled: Boolean(projectId),
  });
}

export function useAvailableRepos(projectId: string, enabled: boolean) {
  return useClientQuery({
    queryKey: queryKeys.github.repos(projectId),
    queryFn: () => getAvailableRepos(projectId),
    enabled: Boolean(projectId) && enabled,
  });
}

export function useLinkRepo(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LinkRepoInput) => linkRepo(projectId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.github.connection(projectId),
      });
    },
  });
}

export function useUnlinkRepo(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => unlinkRepo(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.github.connection(projectId),
      });
    },
  });
}

export function useGithubInstallUrl() {
  return useMutation({
    mutationFn: () => getInstallUrl(),
  });
}
