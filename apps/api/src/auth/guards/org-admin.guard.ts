import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ORG_ADMIN_KEY } from '../decorators/org-admin.decorator';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

@Injectable()
export class OrgAdminGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiresOrgAdmin = this.reflector.getAllAndOverride<boolean>(
      ORG_ADMIN_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiresOrgAdmin) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user: AuthenticatedUser }>();
    const user = request.user;

    if (!user?.orgId || !user.isOrgAdmin) {
      throw new ForbiddenException('Org admin access required');
    }

    return true;
  }
}
