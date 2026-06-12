import type { CreateProjectInput, Project } from "@trakr/schemas";

import { apiFetch } from "./client";

export function createProject(input: CreateProjectInput) {
  return apiFetch<Project>("/projects", {
    method: "POST",
    json: input,
  });
}
