import { PermissionGrant } from './permission-grant.interface';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  orgId: string | null;
  isOrgAdmin: boolean;
  orgGrants: PermissionGrant[];
  projectGrants: Record<string, PermissionGrant[]>;
}
