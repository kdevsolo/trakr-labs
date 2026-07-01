import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  CreateCommentSchema,
  PaginationQuerySchema,
  type CreateCommentInput,
  type PaginationQuery,
} from '@trakr/schemas';
import {
  PermissionAction,
  PermissionResource,
} from '../generated/prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ProjectScoped } from '../auth/decorators/project-scoped.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { ProjectMemberGuard } from '../auth/guards/project-member.guard';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { requireOrgId } from '../auth/utils/require-org-id';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { UuidParamPipe } from '../common/pipes/uuid-param.pipe';
import { CommentsService } from './comments.service';

@Controller('projects/:projectId/issues/:issueId/comments')
@ProjectScoped()
@UseGuards(ProjectMemberGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @RequirePermission(PermissionResource.PROJECT, PermissionAction.READ, 'project')
  list(
    @Param('projectId', UuidParamPipe) projectId: string,
    @Param('issueId', UuidParamPipe) issueId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(PaginationQuerySchema))
    query: PaginationQuery,
  ) {
    return this.commentsService.list(
      projectId,
      requireOrgId(user.orgId),
      issueId,
      query,
    );
  }

  @Post()
  @RequirePermission(PermissionResource.PROJECT, PermissionAction.UPDATE, 'project')
  create(
    @Param('projectId', UuidParamPipe) projectId: string,
    @Param('issueId', UuidParamPipe) issueId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(CreateCommentSchema))
    dto: CreateCommentInput,
  ) {
    return this.commentsService.create(
      projectId,
      requireOrgId(user.orgId),
      issueId,
      user.id,
      dto,
    );
  }
}
