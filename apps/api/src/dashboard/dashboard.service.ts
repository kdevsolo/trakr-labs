import { Injectable } from '@nestjs/common';
import type { DashboardQuery, DashboardSummary } from '@trakr/schemas';
import { PrismaService } from 'src/prisma/prisma.service';

const recentIssueInclude = {
  status: true,
  reporter: { select: { id: true, name: true } },
  assignee: { select: { id: true, name: true } },
  project: { select: { id: true, name: true } },
} as const;

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardSummary(
    orgId: string,
    userId: string,
    query: DashboardQuery,
  ): Promise<DashboardSummary> {
    const projects = await this.prisma.project.findMany({
      where: { orgId, members: { some: { userId } } },
      select: { id: true },
    });

    const projectIds = projects.map((project) => project.id);

    if (projectIds.length === 0) {
      return {
        openIssuesCount: 0,
        unassignedOpenCount: 0,
        recentIssues: [],
      };
    }

    const openStatus = await this.prisma.statusMaster.findFirst({
      where: { orgId, title: 'Open', active: true },
      select: { id: true },
    });

    const openIssuesWhere = openStatus
      ? { projectId: { in: projectIds }, statusId: openStatus.id }
      : null;

    const [openIssuesCount, unassignedOpenCount, recentIssues] =
      await Promise.all([
        openIssuesWhere
          ? this.prisma.issue.count({ where: openIssuesWhere })
          : Promise.resolve(0),
        openIssuesWhere
          ? this.prisma.issue.count({
              where: { ...openIssuesWhere, assignedTo: null },
            })
          : Promise.resolve(0),
        this.prisma.issue.findMany({
          where: { projectId: { in: projectIds } },
          include: recentIssueInclude,
          orderBy: { createdAt: 'desc' },
          take: query.recentLimit,
        }),
      ]);

    return {
      openIssuesCount,
      unassignedOpenCount,
      recentIssues: recentIssues.map((issue) => ({
        id: issue.id,
        title: issue.title,
        projectId: issue.projectId,
        projectName: issue.project.name,
        status: issue.status ?? undefined,
        reporter: issue.reporter,
        assignee: issue.assignee,
        createdAt: issue.createdAt.toISOString(),
      })),
    };
  }
}
