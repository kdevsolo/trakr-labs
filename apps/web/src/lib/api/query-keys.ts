export const queryKeys = {
  all: ["api"] as const,
  health: () => [...queryKeys.all, "health"] as const,
  users: {
    all: () => [...queryKeys.all, "users"] as const,
    me: () => [...queryKeys.users.all(), "me"] as const,
    membersPrefix: () => [...queryKeys.users.all(), "members"] as const,
    members: (params?: Record<string, unknown>) =>
      [...queryKeys.users.membersPrefix(), params ?? {}] as const,
    member: (userId: string) =>
      [...queryKeys.users.members(), userId] as const,
  },
  issues: {
    all: (projectId: string) =>
      [...queryKeys.all, "issues", projectId] as const,
    list: (projectId: string, params?: Record<string, unknown>) =>
      [...queryKeys.issues.all(projectId), "list", params ?? {}] as const,
    detail: (projectId: string, issueId: string) =>
      [...queryKeys.issues.all(projectId), issueId] as const,
    comments: (projectId: string, issueId: string) =>
      [...queryKeys.issues.detail(projectId, issueId), "comments"] as const,
  },
  permissions: {
    all: () => [...queryKeys.all, "permissions"] as const,
    me: () => [...queryKeys.permissions.all(), "me"] as const,
    member: (userId: string) =>
      [...queryKeys.permissions.all(), userId] as const,
    membersBatch: (userIds: string[]) =>
      [...queryKeys.permissions.all(), "batch", userIds.sort().join(",")] as const,
  },
  projects: {
    all: () => [...queryKeys.all, "projects"] as const,
    list: () => [...queryKeys.projects.all(), "list"] as const,
  },
  organizations: {
    all: () => [...queryKeys.all, "organizations"] as const,
    statusMaster: () =>
      [...queryKeys.organizations.all(), "status-master"] as const,
  },
  widget: {
    config: (projectId: string) =>
      [...queryKeys.all, "widget", projectId] as const,
  },
} as const;
