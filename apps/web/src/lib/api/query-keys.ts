export const queryKeys = {
  all: ["api"] as const,
  health: () => [...queryKeys.all, "health"] as const,
  users: {
    all: () => [...queryKeys.all, "users"] as const,
    me: () => [...queryKeys.users.all(), "me"] as const,
    members: () => [...queryKeys.users.all(), "members"] as const,
    member: (userId: string) =>
      [...queryKeys.users.members(), userId] as const,
  },
  issues: {
    all: (projectId: string) =>
      [...queryKeys.all, "issues", projectId] as const,
    list: (projectId: string) =>
      [...queryKeys.issues.all(projectId), "list"] as const,
    detail: (projectId: string, issueId: string) =>
      [...queryKeys.issues.all(projectId), issueId] as const,
  },
} as const;
