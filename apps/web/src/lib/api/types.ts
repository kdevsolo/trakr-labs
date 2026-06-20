export type HealthResponse = {
  status: string;
  timestamp: string;
};

export type {
  CreateIssueInput,
  CreateOrganizationInput,
  InviteUserInput,
  Issue,
  IssueMedia,
  IssueWithRelations,
  MemberPermissions,
  Organization,
  PermissionGrant,
  Project,
  UpdateIssueInput,
  UpdateProfileInput,
  User,
} from '@trakr/schemas';
