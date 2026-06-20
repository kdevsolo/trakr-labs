import { apiFetch } from "./client";
import type {
  CreateIssueInput,
  IssueWithRelations,
  UpdateIssueInput,
} from "./types";

export type IssueWithStatus = IssueWithRelations;

export function listIssues(projectId: string) {
  return apiFetch<IssueWithRelations[]>(`/projects/${projectId}/issues`);
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
