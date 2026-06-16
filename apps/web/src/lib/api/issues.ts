import { apiFetch } from "./client";
import type { CreateIssueInput, Issue, UpdateIssueInput } from "./types";

export type IssueStatusInfo = {
  id: string;
  title: string;
  sortOrder: number;
  active: boolean;
};

export type IssueWithStatus = Issue & {
  status?: IssueStatusInfo;
  assignedBy?: string | null;
  modifiedBy?: string;
  metadata?: unknown;
};

export function listIssues(projectId: string) {
  return apiFetch<IssueWithStatus[]>(`/projects/${projectId}/issues`);
}

export function createIssue(projectId: string, input: CreateIssueInput) {
  return apiFetch<IssueWithStatus>(`/projects/${projectId}/issues`, {
    method: "POST",
    json: input,
  });
}

export function updateIssue(
  projectId: string,
  issueId: string,
  input: UpdateIssueInput,
) {
  return apiFetch<IssueWithStatus>(`/projects/${projectId}/issues/${issueId}`, {
    method: "PATCH",
    json: input,
  });
}

export function deleteIssue(projectId: string, issueId: string) {
  return apiFetch<void>(`/projects/${projectId}/issues/${issueId}`, {
    method: "DELETE",
  });
}
