import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PROJECT_SCOPED_KEY } from '../constants/metadata';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { PermissionsService } from '../permissions.service';
import { requireOrgId } from '../utils/require-org-id';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProjectMemberGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionsService: PermissionsService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isProjectScoped = this.reflector.getAllAndOverride<boolean>(
      PROJECT_SCOPED_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!isProjectScoped) {
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

    const orgId = requireOrgId(user.orgId);

    const projectId = request.params.projectId;
    if (!projectId) {
      throw new ForbiddenException('Project ID is required');
    }

    const project = await this.prisma.project.findFirst({
      where: { id: projectId, orgId },
      select: { id: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found in this organization');
    }

    const isMember = await this.permissionsService.isProjectMember(
      user.id,
      projectId,
      orgId,
    );

    if (!isMember) {
      throw new ForbiddenException('You are not a member of this project');
    }

    return true;
  }
}
