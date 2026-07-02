import { apiFetch } from "./client";
import type {
  EnableWidgetResponse,
  UpdateWidgetSettingsInput,
  WidgetConfig,
} from "@trakr/schemas";

export function getWidgetConfig(projectId: string) {
  return apiFetch<WidgetConfig>(`/projects/${projectId}/widget`);
}

export function updateWidgetSettings(
  projectId: string,
  input: UpdateWidgetSettingsInput,
) {
  return apiFetch<WidgetConfig>(`/projects/${projectId}/widget`, {
    method: "PATCH",
    json: input,
  });
}

export function enableWidget(projectId: string) {
  return apiFetch<EnableWidgetResponse>(`/projects/${projectId}/widget/enable`, {
    method: "POST",
  });
}

export function rotateWidgetSecret(projectId: string) {
  return apiFetch<EnableWidgetResponse>(
    `/projects/${projectId}/widget/rotate-secret`,
    { method: "POST" },
  );
}

export function disableWidget(projectId: string) {
  return apiFetch<WidgetConfig>(`/projects/${projectId}/widget/disable`, {
    method: "POST",
  });
}
