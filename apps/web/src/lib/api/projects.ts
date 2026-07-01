import type {
  AddProjectMemberInput,
  CreateProjectInput,
  PaginatedResponse,
  Project,
} from "@trakr/schemas";

import { apiFetch } from "./client";
import { toSearchParams } from "./search-params";

export function createProject(input: CreateProjectInput) {
  return apiFetch<Project>("/projects", {
    method: "POST",
    json: input,
  });
}

export function listProjects(params?: { page?: number; pageSize?: number }) {
  return apiFetch<PaginatedResponse<Project>>(
    `/projects${toSearchParams(params)}`,
  );
}

export async function listAllProjects(pageSize = 100) {
  const firstPage = await listProjects({ page: 1, pageSize });
  const allItems = [...firstPage.items];
  const totalPages = Math.ceil(firstPage.meta.total / pageSize);

  for (let page = 2; page <= totalPages; page += 1) {
    const nextPage = await listProjects({ page, pageSize });
    allItems.push(...nextPage.items);
  }

  return allItems;
}

export function addProjectMember(input: AddProjectMemberInput) {
  return apiFetch<void>("/projects/add-member", {
    method: "POST",
    json: input,
  });
}
