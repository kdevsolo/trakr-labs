import type { MemberPermissions } from "@trakr/schemas";

import type { Project } from "@/lib/api";

export function canCreateIssueForProject(
  isOrgAdmin: boolean,
  permissions: MemberPermissions | undefined,
  projectId: string,
): boolean {
  if (isOrgAdmin) return true;

  const grants = permissions?.byProject[projectId] ?? [];
  return grants.some(
    (grant) => grant.resource === "PROJECT" && grant.action === "UPDATE",
  );
}

export function getWritableProjects(
  projects: Project[],
  isOrgAdmin: boolean,
  permissions: MemberPermissions | undefined,
): Project[] {
  return projects.filter((project) =>
    canCreateIssueForProject(isOrgAdmin, permissions, project.id),
  );
}

export function canCreateIssueOnAnyProject(
  projects: Project[],
  isOrgAdmin: boolean,
  permissions: MemberPermissions | undefined,
): boolean {
  return getWritableProjects(projects, isOrgAdmin, permissions).length > 0;
}
