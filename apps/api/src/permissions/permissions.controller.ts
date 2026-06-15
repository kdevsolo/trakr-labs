import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  AddProjectMemberByUserIdSchema,
  SetPermissionsSchema,
  type AddProjectMemberByUserIdInput,
  type SetPermissionsInput,
} from '@trakr/schemas';
import { OrgAdminOnly } from '../auth/decorators/org-admin.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OrgAdminGuard } from '../auth/guards/org-admin.guard';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PermissionsService } from '../auth/permissions.service';
import { requireOrgId } from '../auth/utils/require-org-id';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller()
@UseGuards(OrgAdminGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get('org/members/:userId/permissions')
  @OrgAdminOnly()
  getMemberPermissions(
    @CurrentUser() user: AuthenticatedUser,
    @Param('userId') userId: string,
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
    @Param('userId') userId: string,
    @Body(new ZodValidationPipe(SetPermissionsSchema))
    dto: SetPermissionsInput,
  ) {
    return this.permissionsService.setOrgPermissions(user, userId, dto.grants);
  }

  @Post('projects/:projectId/members')
  @OrgAdminOnly()
  addProjectMember(
    @CurrentUser() user: AuthenticatedUser,
    @Param('projectId') projectId: string,
    @Body(new ZodValidationPipe(AddProjectMemberByUserIdSchema))
    dto: AddProjectMemberByUserIdInput,
  ) {
    return this.permissionsService.addProjectMember(
      user,
      projectId,
      dto.userId,
    );
  }

  @Put('projects/:projectId/members/:userId/permissions')
  @OrgAdminOnly()
  setProjectPermissions(
    @CurrentUser() user: AuthenticatedUser,
    @Param('projectId') projectId: string,
    @Param('userId') userId: string,
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
    @Param('projectId') projectId: string,
    @Param('userId') userId: string,
  ) {
    return this.permissionsService.removeProjectMember(user, projectId, userId);
  }
}
