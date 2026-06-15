import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  PermissionAction,
  PermissionResource,
} from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { isGrantAllowed, PermissionScope } from './constants/permissions';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { PermissionGrant } from './interfaces/permission-grant.interface';
import { requireOrgId } from './utils/require-org-id';

@Injectable()
export class PermissionsService {
  private readonly cache = new Map<string, AuthenticatedUser>();

  constructor(private readonly prisma: PrismaService) {}

  invalidateUserCache(userId: string) {
    this.cache.delete(userId);
  }

  hasPermission(
    user: AuthenticatedUser,
    resource: PermissionResource,
    action: PermissionAction,
    projectId?: string,
  ): boolean {
    if (user.isOrgAdmin) {
      return true;
    }

    if (projectId) {
      const grants = user.projectGrants[projectId] ?? [];
      return grants.some(
        (grant) => grant.resource === resource && grant.action === action,
      );
    }

    return user.orgGrants.some(
      (grant) => grant.resource === resource && grant.action === action,
    );
  }

  assertOrgAdmin(user: AuthenticatedUser) {
    if (!user.isOrgAdmin) {
      throw new ForbiddenException('Org admin access required');
    }
  }

  async getMemberPermissions(orgId: string, userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, orgId },
      include: { permissions: true },
    });

    if (!user) {
      throw new NotFoundException('Member not found in this organization');
    }

    const orgWide = user.permissions.filter((p) => p.projectId === null);
    const byProject = user.permissions
      .filter((p) => p.projectId !== null)
      .reduce<
        Record<string, Array<{ resource: PermissionResource; action: PermissionAction }>>
      >((acc, permission) => {
        const projectId = permission.projectId as string;
        if (!acc[projectId]) {
          acc[projectId] = [];
        }
        acc[projectId].push({
          resource: permission.resource,
          action: permission.action,
        });
        return acc;
      }, {});

    return {
      userId: user.id,
      orgId: user.orgId,
      orgWide: orgWide.map((p) => ({
        resource: p.resource,
        action: p.action,
      })),
      byProject,
    };
  }

  async setOrgPermissions(
    actor: AuthenticatedUser,
    targetUserId: string,
    grants: PermissionGrant[],
  ) {
    this.assertOrgAdmin(actor);
    const orgId = requireOrgId(actor.orgId);
    this.validateGrants(grants, 'org', null);

    const target = await this.prisma.user.findFirst({
      where: { id: targetUserId, orgId },
    });
    if (!target) {
      throw new NotFoundException('Member not found in this organization');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.memberPermission.deleteMany({
        where: {
          userId: targetUserId,
          orgId,
          projectId: null,
        },
      });

      if (grants.length > 0) {
        await tx.memberPermission.createMany({
          data: grants.map((grant) => ({
            userId: targetUserId,
            orgId,
            projectId: null,
            resource: grant.resource,
            action: grant.action,
            grantedBy: actor.id,
          })),
        });
      }
    });

    this.invalidateUserCache(targetUserId);
    return this.getMemberPermissions(orgId, targetUserId);
  }

  async setProjectPermissions(
    actor: AuthenticatedUser,
    projectId: string,
    targetUserId: string,
    grants: PermissionGrant[],
  ) {
    this.assertOrgAdmin(actor);
    const orgId = requireOrgId(actor.orgId);
    this.validateGrants(grants, 'project', projectId);

    const project = await this.prisma.project.findFirst({
      where: { id: projectId, orgId },
    });
    if (!project) {
      throw new NotFoundException('Project not found in this organization');
    }

    const membership = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: targetUserId } },
    });
    if (!membership) {
      throw new BadRequestException('User is not a member of this project');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.memberPermission.deleteMany({
        where: {
          userId: targetUserId,
          orgId,
          projectId,
        },
      });

      if (grants.length > 0) {
        await tx.memberPermission.createMany({
          data: grants.map((grant) => ({
            userId: targetUserId,
            orgId,
            projectId,
            resource: grant.resource,
            action: grant.action,
            grantedBy: actor.id,
          })),
        });
      }
    });

    this.invalidateUserCache(targetUserId);
    return this.getMemberPermissions(orgId, targetUserId);
  }

  async removeProjectMember(
    actor: AuthenticatedUser,
    projectId: string,
    userId: string,
  ) {
    this.assertOrgAdmin(actor);
    const orgId = requireOrgId(actor.orgId);

    const project = await this.prisma.project.findFirst({
      where: { id: projectId, orgId },
    });
    if (!project) {
      throw new NotFoundException('Project not found in this organization');
    }

    await this.prisma.projectMember.deleteMany({
      where: { projectId, userId },
    });

    this.invalidateUserCache(userId);
  }

  async isProjectMember(
    userId: string,
    projectId: string,
    orgId: string,
  ): Promise<boolean> {
    const member = await this.prisma.projectMember.findFirst({
      where: {
        userId,
        projectId,
        project: { orgId },
      },
    });
    return member !== null;
  }

  private validateGrants(
    grants: PermissionGrant[],
    scope: PermissionScope,
    projectId: string | null,
  ) {
    for (const grant of grants) {
      if (!isGrantAllowed(scope, grant.resource, grant.action)) {
        throw new BadRequestException(
          `${grant.resource}:${grant.action} is not allowed in the ${scope} scope`,
        );
      }
      if (projectId && grant.projectId && grant.projectId !== projectId) {
        throw new BadRequestException('Grant projectId must match target project');
      }
    }
  }
}
