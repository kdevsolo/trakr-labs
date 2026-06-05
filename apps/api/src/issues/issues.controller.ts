import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  PermissionAction,
  PermissionResource,
} from '../generated/prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ProjectScoped } from '../auth/decorators/project-scoped.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { ProjectMemberGuard } from '../auth/guards/project-member.guard';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { requireOrgId } from '../auth/utils/require-org-id';
import { IssuesService } from './issues.service';

@Controller('projects/:projectId/issues')
@ProjectScoped()
@UseGuards(ProjectMemberGuard)
export class IssuesController {
  constructor(private readonly issuesService: IssuesService) {}

  @Get()
  @RequirePermission(PermissionResource.ISSUE, PermissionAction.READ)
  list(
    @Param('projectId') projectId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.issuesService.list(projectId, requireOrgId(user.orgId));
  }

  @Post()
  @RequirePermission(PermissionResource.ISSUE, PermissionAction.CREATE)
  create(
    @Param('projectId') projectId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateIssueDto,
  ) {
    return this.issuesService.create(
      projectId,
      requireOrgId(user.orgId),
      user.id,
      dto,
    );
  }

  @Patch(':id')
  @RequirePermission(PermissionResource.ISSUE, PermissionAction.UPDATE)
  update(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateIssueDto,
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
  @RequirePermission(PermissionResource.ISSUE, PermissionAction.DELETE)
  remove(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.issuesService.remove(projectId, requireOrgId(user.orgId), id);
  }
}
