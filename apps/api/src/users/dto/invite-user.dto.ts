import { PermissionAction, PermissionResource } from '../../generated/prisma/client';

export class InvitePermissionDto {
  resource!: PermissionResource;
  action!: PermissionAction;
  projectId?: string;
}

export class InviteUserDto {
  name!: string;
  email!: string;
  permissions!: InvitePermissionDto[];
}
