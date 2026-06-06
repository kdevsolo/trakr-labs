import { apiFetch } from "./client";
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

export function listOrgMembers() {
  return apiFetch<User[]>("/org/members");
}

export function getOrgMember(userId: string) {
  return apiFetch<User>(`/org/members/${userId}`);
}
