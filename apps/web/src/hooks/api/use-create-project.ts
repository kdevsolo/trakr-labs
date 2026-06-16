import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateProjectInput } from "@trakr/schemas";

import { createProject, queryKeys } from "@/lib/api";
import type { Project } from "@/lib/api";

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProjectInput) => createProject(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.list() });
    },
  });
}

export type { Project };
