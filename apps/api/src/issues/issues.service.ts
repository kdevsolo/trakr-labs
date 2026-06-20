import { Injectable, NotFoundException } from '@nestjs/common';
import type { CreateIssueInput, UpdateIssueInput } from '@trakr/schemas';
import { withSignedIssueMedia, withSignedIssueMediaList } from '../widget/utils/widget-storage';
import { PrismaService } from '../prisma/prisma.service';

const issueInclude = {
  status: true,
  media: { orderBy: { createdAt: 'asc' as const } },
  reporter: { select: { id: true, name: true } },
  assignee: { select: { id: true, name: true } },
} as const;

@Injectable()
export class IssuesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(projectId: string, orgId: string) {
    await this.assertProjectInOrg(projectId, orgId);

    return withSignedIssueMediaList(
      await this.prisma.issue.findMany({
        where: { projectId },
        include: issueInclude,
        orderBy: { createdAt: 'desc' },
      }),
    );
  }

  async create(
    projectId: string,
    orgId: string,
    userId: string,
    dto: CreateIssueInput,
  ) {
    await this.assertProjectInOrg(projectId, orgId);

    return withSignedIssueMedia(
      await this.prisma.issue.create({
        data: {
          title: dto.title,
          description: dto.description,
          statusId: dto.statusId,
          projectId,
          reportedBy: userId,
          assignedTo: dto.assignedTo,
          assignedBy: dto.assignedTo ? userId : null,
          modifiedBy: userId,
        },
        include: issueInclude,
      }),
    );
  }

  async update(
    projectId: string,
    orgId: string,
    issueId: string,
    userId: string,
    dto: UpdateIssueInput,
  ) {
    await this.assertProjectInOrg(projectId, orgId);
    await this.assertIssueInProject(issueId, projectId);

    return withSignedIssueMedia(
      await this.prisma.issue.update({
        where: { id: issueId },
        data: {
          title: dto.title,
          description: dto.description,
          statusId: dto.statusId,
          assignedTo: dto.assignedTo,
          assignedBy: dto.assignedTo !== undefined ? userId : undefined,
          modifiedBy: userId,
        },
        include: issueInclude,
      }),
    );
  }

  async remove(projectId: string, orgId: string, issueId: string) {
    await this.assertProjectInOrg(projectId, orgId);
    await this.assertIssueInProject(issueId, projectId);

    await this.prisma.issue.delete({ where: { id: issueId } });
    return { deleted: true };
  }

  private async assertProjectInOrg(projectId: string, orgId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, orgId },
      select: { id: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found in this organization');
    }
  }

  private async assertIssueInProject(issueId: string, projectId: string) {
    const issue = await this.prisma.issue.findFirst({
      where: { id: issueId, projectId },
      select: { id: true },
    });

    if (!issue) {
      throw new NotFoundException('Issue not found in this project');
    }
  }
}
