import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_PERMISSION_KEY } from '../constants/metadata';
import { RequiredPermission } from '../decorators/require-permission.decorator';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { PermissionsService } from '../permissions.service';
import { isProjectScopedResource } from '../constants/permissions';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionsService: PermissionsService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<RequiredPermission>(
      REQUIRE_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      user: AuthenticatedUser;
      params: { projectId?: string };
    }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    if (!isProjectScopedResource(required.resource) && !user.orgId) {
      throw new ForbiddenException('Organization membership required');
    }

    const projectId = isProjectScopedResource(required.resource)
      ? request.params.projectId
      : undefined;

    const allowed = this.permissionsService.hasPermission(
      user,
      required.resource,
      required.action,
      projectId,
    );

    if (!allowed) {
      throw new ForbiddenException(
        `Missing permission: ${required.resource}:${required.action}`,
      );
    }

    return true;
  }
}
