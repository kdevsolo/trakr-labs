import type { ListIssuesQuery, PaginatedResponse } from "@trakr/schemas";

import { apiFetch } from "./client";
import { toSearchParams } from "./search-params";
import type {
  CreateIssueInput,
  IssueWithRelations,
  UpdateIssueInput,
} from "./types";

export type IssueWithStatus = IssueWithRelations;
export type ListIssuesParams = ListIssuesQuery;

export function listIssues(projectId: string, params?: ListIssuesParams) {
  return apiFetch<PaginatedResponse<IssueWithRelations>>(
    `/projects/${projectId}/issues${toSearchParams(params)}`,
  );
}

export function createIssue(projectId: string, input: CreateIssueInput) {
  return apiFetch<IssueWithRelations>(`/projects/${projectId}/issues`, {
    method: "POST",
    json: input,
  });
}

export function updateIssue(
  projectId: string,
  issueId: string,
  input: UpdateIssueInput,
) {
  return apiFetch<IssueWithRelations>(`/projects/${projectId}/issues/${issueId}`, {
    method: "PATCH",
    json: input,
  });
}

export function deleteIssue(projectId: string, issueId: string) {
  return apiFetch<void>(`/projects/${projectId}/issues/${issueId}`, {
    method: "DELETE",
  });
}
