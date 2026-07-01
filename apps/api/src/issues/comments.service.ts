import { Injectable, NotFoundException } from '@nestjs/common';
import type { CreateCommentInput, PaginationQuery } from '@trakr/schemas';
import { PrismaService } from '../prisma/prisma.service';

const commentSelect = {
  id: true,
  issueId: true,
  authorId: true,
  content: true,
  createdAt: true,
  author: { select: { id: true, name: true } },
} as const;

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    projectId: string,
    orgId: string,
    issueId: string,
    query: PaginationQuery,
  ) {
    await this.assertIssueInProject(issueId, projectId, orgId);

    const { page, pageSize } = query;
    const skip = (page - 1) * pageSize;
    const where = { issueId };

    const [items, total] = await Promise.all([
      this.prisma.comment.findMany({
        where,
        select: commentSelect,
        orderBy: { createdAt: 'asc' },
        skip,
        take: pageSize,
      }),
      this.prisma.comment.count({ where }),
    ]);

    return {
      items,
      meta: { page, pageSize, total },
    };
  }

  async create(
    projectId: string,
    orgId: string,
    issueId: string,
    authorId: string,
    dto: CreateCommentInput,
  ) {
    await this.assertIssueInProject(issueId, projectId, orgId);

    return this.prisma.comment.create({
      data: {
        issueId,
        authorId,
        content: dto.content,
      },
      select: commentSelect,
    });
  }

  private async assertIssueInProject(
    issueId: string,
    projectId: string,
    orgId: string,
  ) {
    const issue = await this.prisma.issue.findFirst({
      where: { id: issueId, projectId, project: { orgId } },
      select: { id: true },
    });

    if (!issue) {
      throw new NotFoundException('Issue not found in this project');
    }
  }
}
