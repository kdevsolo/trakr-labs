import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { AddProjectMemberInput, CreateProjectInput, UpdateProjectInput } from '@trakr/schemas';
import {
  PROJECT_SCOPED_RESOURCES,
} from 'src/auth/constants/permissions';
import { PermissionsService } from 'src/auth/permissions.service';
import { requireOrgId } from 'src/auth/utils/require-org-id';
import {
  PermissionAction,
  PermissionResource,
} from 'src/generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';
import { generateProjectKey } from 'src/utils/generate-project-key';

const ALL_ACTIONS = [
  PermissionAction.READ,
  PermissionAction.CREATE,
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

      // Grant all permissions to the creator and project scoped resources
      await tx.memberPermission.createMany({
        data: [
          ...ALL_ACTIONS.map((action) => ({
            userId,
            orgId,
            projectId: null,
            resource: PermissionResource.PROJECT,
            action,
            grantedBy: userId,
          })),
          ...PROJECT_SCOPED_RESOURCES.flatMap((resource) =>
            ALL_ACTIONS.map((action) => ({
              userId,
              orgId,
              projectId: created.id,
              resource,
              action,
              grantedBy: userId,
            })),
          ),
        ],
      });

      return created;
    });

    this.permissionsService.invalidateUserCache(userId);
    return project;
  }

  async addProjectMember(userId: string, addProjectMemberDto: AddProjectMemberInput) {
    const { projectId, userId: memberUserId, actions } = addProjectMemberDto;

    const member = await this.prisma.user.findUnique({
      where: { id: memberUserId },
    });
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    const orgId = requireOrgId(member.orgId);
    if (!orgId) {
      throw new ForbiddenException('You are not allowed to add members to this project');
    }

    this.prisma.$transaction(async (tx) => {
      await tx.projectMember.create({
        data: { projectId, userId: memberUserId, addedBy: userId },
      });
      if (actions && actions.length > 0) {
        await tx.memberPermission.createMany({
          data: actions.map((action) => ({
            userId: memberUserId,
            orgId,
            projectId,
            resource: PermissionResource.PROJECT,
            action: action as PermissionAction,
            grantedBy: userId,
          })),
        });
      }
    });
    this.permissionsService.invalidateUserCache(userId);
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

  findOne(id: number) {
    return `This action returns a #${id} project`;
  }

  update(id: number, updateProjectDto: UpdateProjectInput) {
    return `This action updates a #${id} project`;
  }

  remove(id: number) {
    return `This action removes a #${id} project`;
  }
}
