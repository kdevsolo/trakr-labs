import {
  PermissionAction,
  PermissionResource,
} from '../../generated/prisma/client';

export class PermissionGrantDto {
  resource!: PermissionResource;
  action!: PermissionAction;
}

export class SetPermissionsDto {
  grants!: PermissionGrantDto[];
}

export class AddProjectMemberDto {
  userId!: string;
}
