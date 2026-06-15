import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  addProjectMember,
  queryKeys,
  removeProjectMember,
  setOrgPermissions,
  setProjectPermissions,
} from "@/lib/api";
import type { PermissionGrant } from "@/lib/api/types";

export function useSetOrgPermissions(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (grants: PermissionGrant[]) =>
      setOrgPermissions(userId, grants),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.permissions.member(userId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.members() });
    },
  });
}

export function useSetProjectPermissions(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      grants,
    }: {
      projectId: string;
      grants: PermissionGrant[];
    }) => setProjectPermissions(projectId, userId, grants),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.permissions.member(userId),
      });
    },
  });
}

export function useRemoveProjectMember(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => removeProjectMember(projectId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.permissions.member(userId),
      });
    },
  });
}

export function useAddProjectMember() {
  return useMutation({
    mutationFn: addProjectMember,
  });
}
