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

export function getIssue(projectId: string, issueId: string) {
  return apiFetch<IssueWithRelations>(
    `/projects/${projectId}/issues/${issueId}`,
  );
}

export async function listAllIssues(
  projectId: string,
  params?: Omit<ListIssuesParams, "page" | "pageSize">,
  pageSize = 100,
) {
  const firstPage = await listIssues(projectId, { ...params, page: 1, pageSize });
  const allItems = [...firstPage.items];
  const totalPages = Math.ceil(firstPage.meta.total / pageSize);

  for (let page = 2; page <= totalPages; page += 1) {
    const nextPage = await listIssues(projectId, { ...params, page, pageSize });
    allItems.push(...nextPage.items);
  }

  return allItems;
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
