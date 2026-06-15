import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  AddProjectMemberInput,
  CreateProjectInput,
  UpdateProjectInput,
} from '@trakr/schemas';
import { isGrantAllowed } from 'src/auth/constants/permissions';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { PermissionsService } from 'src/auth/permissions.service';
import { requireOrgId } from 'src/auth/utils/require-org-id';
import {
  PermissionAction,
  PermissionResource,
} from 'src/generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';
import { generateProjectKey } from 'src/utils/generate-project-key';

// Per-project actions that govern a project and its issues/comments.
const PROJECT_MEMBER_ACTIONS = [
  PermissionAction.READ,
  PermissionAction.UPDATE,
  PermissionAction.DELETE,
] as const;

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly permissionsService: PermissionsService,
  ) {}

  async create(userId: string, createProjectDto: CreateProjectInput) {
    const { orgId } = createProjectDto;
    const projectKey = generateProjectKey(createProjectDto.name, userId);

    const project = await this.prisma.$transaction(async (tx) => {
      const created = await tx.project.create({
        data: {
          name: createProjectDto.name,
          projectKey,
          orgId,
          createdBy: userId,
          modifiedBy: userId,
        },
      });

      await tx.projectMember.create({
        data: {
          projectId: created.id,
          userId,
          addedBy: userId,
        },
      });

      // Creator keeps org-wide ability to create projects, and gets full
      // per-project control (READ/UPDATE/DELETE) over the new project, which
      // also governs that project's issues and comments.
      await tx.memberPermission.createMany({
        data: [
          {
            userId,
            orgId,
            projectId: null,
            resource: PermissionResource.PROJECT,
            action: PermissionAction.CREATE,
            grantedBy: userId,
          },
          ...PROJECT_MEMBER_ACTIONS.map((action) => ({
            userId,
            orgId,
            projectId: created.id,
            resource: PermissionResource.PROJECT,
            action,
            grantedBy: userId,
          })),
        ],
      });

      return created;
    });

    this.permissionsService.invalidateUserCache(userId);
    return project;
  }

  async addProjectMember(
    actor: AuthenticatedUser,
    addProjectMemberDto: AddProjectMemberInput,
  ) {
    const { projectId, userId: memberUserId, actions } = addProjectMemberDto;
    const orgId = requireOrgId(actor.orgId);

    const [project, member] = await Promise.all([
      this.prisma.project.findFirst({ where: { id: projectId, orgId } }),
      this.prisma.user.findFirst({ where: { id: memberUserId, orgId } }),
    ]);

    if (!project) {
      throw new NotFoundException('Project not found in this organization');
    }
    if (!member) {
      throw new NotFoundException('Member not found in this organization');
    }

    const grantActions = (actions ?? []) as PermissionAction[];
    for (const action of grantActions) {
      if (!isGrantAllowed('project', PermissionResource.PROJECT, action)) {
        throw new BadRequestException(
          `${action} is not allowed as a project permission`,
        );
      }
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.projectMember.upsert({
        where: { projectId_userId: { projectId, userId: memberUserId } },
        create: { projectId, userId: memberUserId, addedBy: actor.id },
        update: {},
      });

      await tx.memberPermission.deleteMany({
        where: {
          userId: memberUserId,
          orgId,
          projectId,
          resource: PermissionResource.PROJECT,
        },
      });

      if (grantActions.length > 0) {
        await tx.memberPermission.createMany({
          data: grantActions.map((action) => ({
            userId: memberUserId,
            orgId,
            projectId,
            resource: PermissionResource.PROJECT,
            action,
            grantedBy: actor.id,
          })),
        });
      }
    });

    this.permissionsService.invalidateUserCache(memberUserId);
    return { success: true };
  }

  async findAll(orgId: string, userId: string) {
    const member = await this.prisma.projectMember.findFirst({
      where: { userId, project: { orgId } },
    });
    if (!member) {
      throw new ForbiddenException('You are not a member of this project');
    }
    return this.prisma.project.findMany({
      where: { orgId, members: { some: { userId } } },
    });
  }

  findOne(id: string) {
    return `This action returns a #${id} project`;
  }

  update(id: string, updateProjectDto: UpdateProjectInput) {
    return `This action updates a #${id} project`;
  }

  remove(id: string) {
    return `This action removes a #${id} project`;
  }
}
