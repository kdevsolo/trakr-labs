import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  BatchMemberPermissionsQuerySchema,
  SetPermissionsSchema,
  type BatchMemberPermissionsQuery,
  type SetPermissionsInput,
} from '@trakr/schemas';
import { OrgAdminOnly } from '../auth/decorators/org-admin.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OrgAdminGuard } from '../auth/guards/org-admin.guard';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PermissionsService } from '../auth/permissions.service';
import { requireOrgId } from '../auth/utils/require-org-id';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { UuidParamPipe } from '../common/pipes/uuid-param.pipe';

@Controller()
@UseGuards(OrgAdminGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get('org/members/permissions')
  @OrgAdminOnly()
  getBatchMemberPermissions(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(BatchMemberPermissionsQuerySchema))
    query: BatchMemberPermissionsQuery,
  ) {
    return this.permissionsService.getBatchMemberPermissions(
      requireOrgId(user.orgId),
      query.userIds,
    );
  }

  @Get('org/members/:userId/permissions')
  @OrgAdminOnly()
  getMemberPermissions(
    @CurrentUser() user: AuthenticatedUser,
    @Param('userId', UuidParamPipe) userId: string,
  ) {
    return this.permissionsService.getMemberPermissions(
      requireOrgId(user.orgId),
      userId,
    );
  }

  @Put('org/members/:userId/permissions')
  @OrgAdminOnly()
  setOrgPermissions(
    @CurrentUser() user: AuthenticatedUser,
    @Param('userId', UuidParamPipe) userId: string,
    @Body(new ZodValidationPipe(SetPermissionsSchema))
    dto: SetPermissionsInput,
  ) {
    return this.permissionsService.setOrgPermissions(user, userId, dto.grants);
  }

  @Put('projects/:projectId/members/:userId/permissions')
  @OrgAdminOnly()
  setProjectPermissions(
    @CurrentUser() user: AuthenticatedUser,
    @Param('projectId', UuidParamPipe) projectId: string,
    @Param('userId', UuidParamPipe) userId: string,
    @Body(new ZodValidationPipe(SetPermissionsSchema))
    dto: SetPermissionsInput,
  ) {
    return this.permissionsService.setProjectPermissions(
      user,
      projectId,
      userId,
      dto.grants,
    );
  }

  @Delete('projects/:projectId/members/:userId')
  @OrgAdminOnly()
  removeProjectMember(
    @CurrentUser() user: AuthenticatedUser,
    @Param('projectId', UuidParamPipe) projectId: string,
    @Param('userId', UuidParamPipe) userId: string,
  ) {
    return this.permissionsService.removeProjectMember(user, projectId, userId);
  }
}
