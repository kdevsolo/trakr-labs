import { apiFetch } from "./client";
import type { CreateOrganizationInput, Organization, StatusMaster } from "@trakr/schemas";

export function createOrganization(input: CreateOrganizationInput) {
  return apiFetch<Organization>("/organizations", {
    method: "POST",
    json: input,
  });
}

export function getStatusMaster() {
  return apiFetch<StatusMaster[]>("/organizations/status-master");
}
