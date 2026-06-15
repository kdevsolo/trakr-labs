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

    if (user.isOrgAdmin) {
      return true;
    }

    if (!user.orgId) {
      throw new ForbiddenException('Organization membership required');
    }

    let projectId: string | undefined;
    if (required.scope === 'project') {
      projectId = request.params.projectId;
      if (!projectId) {
        throw new ForbiddenException('Project ID is required');
      }
    }

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
