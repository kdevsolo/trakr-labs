import { apiFetch } from "./client";
import type { Comment, CreateCommentInput } from "./types";

export function listIssueComments(projectId: string, issueId: string) {
  return apiFetch<Comment[]>(
    `/projects/${projectId}/issues/${issueId}/comments`,
  );
}

export function createIssueComment(
  projectId: string,
  issueId: string,
  input: CreateCommentInput,
) {
  return apiFetch<Comment>(
    `/projects/${projectId}/issues/${issueId}/comments`,
    {
      method: "POST",
      json: input,
    },
  );
}
