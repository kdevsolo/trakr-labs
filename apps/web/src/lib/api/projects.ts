import type {
  AddProjectMemberInput,
  CreateProjectInput,
  Project,
} from "@trakr/schemas";

import { apiFetch } from "./client";

export function createProject(input: CreateProjectInput) {
  return apiFetch<Project>("/projects", {
    method: "POST",
    json: input,
  });
}

export function listProjects() {
  return apiFetch<Project[]>("/projects");
}

export function addProjectMember(input: AddProjectMemberInput) {
  return apiFetch<void>("/projects/add-member", {
    method: "POST",
    json: input,
  });
}
