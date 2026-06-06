import { apiFetch } from "./client";
import type { CreateOrganizationInput } from "@trakr/schemas";
import type { Organization } from "@trakr/schemas";

export function createOrganization(input: CreateOrganizationInput) {
  return apiFetch<Organization>("/organizations", {
    method: "POST",
    json: input,
  });
}
