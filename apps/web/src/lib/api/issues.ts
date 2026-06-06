import { apiFetch } from "./client";
import type { CreateIssueInput, Issue, UpdateIssueInput } from "./types";

export function listIssues(projectId: string) {
  return apiFetch<Issue[]>(`/projects/${projectId}/issues`);
}

export function createIssue(projectId: string, input: CreateIssueInput) {
  return apiFetch<Issue>(`/projects/${projectId}/issues`, {
    method: "POST",
    json: input,
  });
}

export function updateIssue(
  projectId: string,
  issueId: string,
  input: UpdateIssueInput,
) {
  return apiFetch<Issue>(`/projects/${projectId}/issues/${issueId}`, {
    method: "PATCH",
    json: input,
  });
}

export function deleteIssue(projectId: string, issueId: string) {
  return apiFetch<void>(`/projects/${projectId}/issues/${issueId}`, {
    method: "DELETE",
  });
}
