export type HealthResponse = {
  status: string;
  timestamp: string;
};

export type {
  ApiErrorResponse,
  ApiSuccessResponse,
  Comment,
  CreateCommentInput,
  CreateIssueInput,
  CreateOrganizationInput,
  InviteUserInput,
  Issue,
  IssueMedia,
  IssueWithRelations,
  ListIssuesQuery,
  MemberPermissions,
  Organization,
  PaginatedResponse,
  PaginationMeta,
  PaginationQuery,
  PermissionGrant,
  Project,
  StatusMaster,
  UpdateIssueInput,
  UpdateProfileInput,
  AcceptTermsInput,
  User,
} from '@trakr/schemas';
