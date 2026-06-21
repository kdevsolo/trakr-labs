export type HealthResponse = {
  status: string;
  timestamp: string;
};

export type {
  ApiErrorResponse,
  ApiSuccessResponse,
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
  StatusMaster,
  UpdateIssueInput,
  UpdateProfileInput,
  User,
} from '@trakr/schemas';
