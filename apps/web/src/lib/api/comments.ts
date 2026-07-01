import type { PaginatedResponse } from "@trakr/schemas";

import { apiFetch } from "./client";
import { toSearchParams } from "./search-params";
import type { Comment, CreateCommentInput } from "./types";

export function listIssueComments(
  projectId: string,
  issueId: string,
  params?: { page?: number; pageSize?: number },
) {
  return apiFetch<PaginatedResponse<Comment>>(
    `/projects/${projectId}/issues/${issueId}/comments${toSearchParams(params)}`,
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
