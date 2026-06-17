import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  disableWidget,
  enableWidget,
  getWidgetConfig,
  queryKeys,
  rotateWidgetSecret,
} from "@/lib/api";

export function useWidgetConfig(projectId: string) {
  return useQuery({
    queryKey: queryKeys.widget.config(projectId),
    queryFn: () => getWidgetConfig(projectId),
    enabled: Boolean(projectId),
  });
}

export function useEnableWidget(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => enableWidget(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.widget.config(projectId),
      });
    },
  });
}

export function useRotateWidgetSecret(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => rotateWidgetSecret(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.widget.config(projectId),
      });
    },
  });
}

export function useDisableWidget(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => disableWidget(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.widget.config(projectId),
      });
    },
  });
}
