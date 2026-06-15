export type HealthResponse = {
  status: string;
  timestamp: string;
};

export type {
  CreateIssueInput,
  CreateOrganizationInput,
  InviteUserInput,
  Issue,
  MemberPermissions,
  Organization,
  PermissionGrant,
  Project,
  UpdateIssueInput,
  UpdateProfileInput,
  User,
} from '@trakr/schemas';
