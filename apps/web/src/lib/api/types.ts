export type User = {
  id: string;
  name: string;
  email: string;
  orgId: string | null;
  isOrgAdmin: boolean;
  createdAt: string;
  updatedAt: string;
};

export type HealthResponse = {
  status: string;
  timestamp: string;
};

export type UpdateProfileInput = {
  name: string;
};

export type Issue = {
  id: string;
  title: string;
  description: string | null;
  projectId: string;
  statusId: string;
  reportedBy: string;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateIssueInput = {
  title: string;
  description?: string;
  statusId: string;
  assignedTo?: string;
};

export type UpdateIssueInput = {
  title?: string;
  description?: string;
  statusId?: string;
  assignedTo?: string | null;
};

export type { CreateOrganizationInput } from '@trakr/schemas';

export type CreateOrganizationResponse = {
  id: string;
  name: string;
  ownerId: string;
  createdBy: string;
  modifiedBy: string;
  createdAt: string;
  updatedAt: string;
};