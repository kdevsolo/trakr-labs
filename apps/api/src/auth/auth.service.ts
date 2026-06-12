import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { PermissionGrant } from './interfaces/permission-grant.interface';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveUser(payload: JwtPayload): Promise<AuthenticatedUser> {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token: missing subject');
    }

    let user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { permissions: true },
    });

    if (!user) {
      user = await this.provisionUser(payload);
    } else {
      await this.prisma.userInvite.updateMany({
        where: { userId: user.id, status: 'PENDING' },
        data: { status: 'ACCEPTED' },
      });
    }

    return this.toAuthenticatedUser(user);
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
      include: { permissions: true },
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
    };
  }
}
