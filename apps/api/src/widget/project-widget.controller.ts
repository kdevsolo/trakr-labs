import {
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { RequirePermission } from 'src/auth/decorators/require-permission.decorator';
import { ProjectScoped } from 'src/auth/decorators/project-scoped.decorator';
import { ProjectMemberGuard } from 'src/auth/guards/project-member.guard';
import { PermissionAction, PermissionResource } from 'src/generated/prisma/enums';
import { requireOrgId } from 'src/auth/utils/require-org-id';
import { UuidParamPipe } from 'src/common/pipes/uuid-param.pipe';
import { WidgetService } from './widget.service';

@Controller('projects/:projectId/widget')
@ProjectScoped()
@UseGuards(ProjectMemberGuard)
export class ProjectWidgetController {
  constructor(private readonly widgetService: WidgetService) {}

  @Get()
  @RequirePermission(PermissionResource.PROJECT, PermissionAction.READ, 'project')
  getConfig(
    @Param('projectId', UuidParamPipe) projectId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.widgetService.getConfig(projectId, requireOrgId(user.orgId));
  }

  @Post('enable')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @RequirePermission(PermissionResource.PROJECT, PermissionAction.UPDATE, 'project')
  enable(
    @Param('projectId', UuidParamPipe) projectId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.widgetService.enableWidget(
      projectId,
      requireOrgId(user.orgId),
      user.id,
    );
  }

  @Post('rotate-secret')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @RequirePermission(PermissionResource.PROJECT, PermissionAction.UPDATE, 'project')
  rotateSecret(
    @Param('projectId', UuidParamPipe) projectId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.widgetService.rotateSecret(
      projectId,
      requireOrgId(user.orgId),
      user.id,
    );
  }

  @Post('disable')
  @RequirePermission(PermissionResource.PROJECT, PermissionAction.UPDATE, 'project')
  disable(
    @Param('projectId', UuidParamPipe) projectId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.widgetService.disableWidget(
      projectId,
      requireOrgId(user.orgId),
      user.id,
    );
  }
}
