import type { InviteUserInput, PaginatedResponse, PaginationQuery } from "@trakr/schemas";

import { apiFetch } from "./client";
import { toSearchParams } from "./search-params";
import type { UpdateProfileInput, User } from "./types";

export function getMe(accessToken?: string) {
  return apiFetch<User>("/users/me", { accessToken });
}

export function updateMe(input: UpdateProfileInput) {
  return apiFetch<User>("/users/me", {
    method: "PATCH",
    json: input,
  });
}

export function acceptTerms(accessToken?: string) {
  return apiFetch<User>("/users/me/terms", {
    method: "PATCH",
    json: { tncAccepted: true },
    accessToken,
  });
}

export function listOrgMembers(params?: PaginationQuery) {
  return apiFetch<PaginatedResponse<User>>(
    `/org/members${toSearchParams(params)}`,
  );
}

export function getOrgMember(userId: string) {
  return apiFetch<User>(`/org/members/${userId}`);
}

export function inviteOrgMember(input: InviteUserInput) {
  return apiFetch<{ id: string }>("/org/members/invite", {
    method: "POST",
    json: input,
  });
}
