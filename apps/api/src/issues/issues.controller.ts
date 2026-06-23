import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  CreateIssueSchema,
  ListIssuesQuerySchema,
  UpdateIssueSchema,
  type CreateIssueInput,
  type ListIssuesQuery,
  type UpdateIssueInput,
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
import { IssuesService } from './issues.service';

@Controller('projects/:projectId/issues')
@ProjectScoped()
@UseGuards(ProjectMemberGuard)
export class IssuesController {
  constructor(private readonly issuesService: IssuesService) {}

  @Get()
  @RequirePermission(PermissionResource.PROJECT, PermissionAction.READ, 'project')
  list(
    @Param('projectId') projectId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(ListIssuesQuerySchema))
    query: ListIssuesQuery,
  ) {
    return this.issuesService.list(
      projectId,
      requireOrgId(user.orgId),
      query,
    );
  }

  @Post()
  @RequirePermission(PermissionResource.PROJECT, PermissionAction.UPDATE, 'project')
  create(
    @Param('projectId') projectId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(CreateIssueSchema))
    dto: CreateIssueInput,
  ) {
    return this.issuesService.create(
      projectId,
      requireOrgId(user.orgId),
      user.id,
      dto,
    );
  }

  @Patch(':id')
  @RequirePermission(PermissionResource.PROJECT, PermissionAction.UPDATE, 'project')
  update(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(UpdateIssueSchema))
    dto: UpdateIssueInput,
  ) {
    return this.issuesService.update(
      projectId,
      requireOrgId(user.orgId),
      id,
      user.id,
      dto,
    );
  }

  @Delete(':id')
  @RequirePermission(PermissionResource.PROJECT, PermissionAction.UPDATE, 'project')
  remove(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.issuesService.remove(projectId, requireOrgId(user.orgId), id);
  }

}
