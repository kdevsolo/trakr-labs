import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PermissionsService } from './permissions.service';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { PermissionGrant } from './interfaces/permission-grant.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly permissionsService: PermissionsService,
  ) {}

  async resolveUser(payload: JwtPayload): Promise<AuthenticatedUser> {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token: missing subject');
    }

    const cached = this.permissionsService.getCachedUser(payload.sub);
    if (cached) {
      return cached;
    }

    let user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        permissions: true,
        invite: true,
        projectMembers: { select: { projectId: true } },
      },
    });

    if (!user) {
      user = await this.provisionUser(payload);
    } else if (user.invite?.status === 'PENDING') {
      await this.prisma.userInvite.updateMany({
        where: { userId: user.id, status: 'PENDING' },
        data: { status: 'ACCEPTED' },
      });
    }

    const authenticatedUser = this.toAuthenticatedUser(user);
    this.permissionsService.setCachedUser(authenticatedUser);
    return authenticatedUser;
  }

  private async provisionUser(payload: JwtPayload) {
    const email = payload.email;
    if (!email) {
      throw new UnauthorizedException(
        'Invalid token: email required for first-time provisioning',
      );
    }

    const name =
      payload.user_metadata?.name ??
      payload.user_metadata?.full_name ??
      email.split('@')[0];

    return this.prisma.user.create({
      data: {
        id: payload.sub,
        email,
        name,
      },
      include: {
        permissions: true,
        invite: true,
        projectMembers: { select: { projectId: true } },
      },
    });
  }

  private toAuthenticatedUser(
    user: {
      id: string;
      email: string;
      name: string;
      orgId: string | null;
      isOrgAdmin: boolean;
      permissions: Array<{
        resource: PermissionGrant['resource'];
        action: PermissionGrant['action'];
        projectId: string | null;
      }>;
      projectMembers: Array<{ projectId: string }>;
    },
  ): AuthenticatedUser {
    const orgGrants: PermissionGrant[] = [];
    const projectGrants: Record<string, PermissionGrant[]> = {};

    for (const permission of user.permissions) {
      const grant: PermissionGrant = {
        resource: permission.resource,
        action: permission.action,
        projectId: permission.projectId,
      };

      if (permission.projectId) {
        if (!projectGrants[permission.projectId]) {
          projectGrants[permission.projectId] = [];
        }
        projectGrants[permission.projectId].push(grant);
      } else {
        orgGrants.push(grant);
      }
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      orgId: user.orgId,
      isOrgAdmin: user.isOrgAdmin,
      orgGrants,
      projectGrants,
      projectIds: user.projectMembers.map((member) => member.projectId),
    };
  }
}
