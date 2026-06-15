import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  CreateOrganizationSchema,
  InviteUserSchema,
  UpdateMemberSchema,
  UpdateProfileSchema,
  type CreateOrganizationInput,
  type InviteUserInput,
  type UpdateMemberInput,
  type UpdateProfileInput,
} from '@trakr/schemas';
import {
  PermissionAction,
  PermissionResource,
} from '../generated/prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OrgAdminOnly } from '../auth/decorators/org-admin.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { OrgAdminGuard } from '../auth/guards/org-admin.guard';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { requireOrgId } from '../auth/utils/require-org-id';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('users/me')
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.getMe(user.id);
  }

  @Patch('users/me')
  updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(UpdateProfileSchema))
    dto: UpdateProfileInput,
  ) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Get('org/members')
  @RequirePermission(PermissionResource.USER, PermissionAction.READ)
  listMembers(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.listByOrg(requireOrgId(user.orgId));
  }

  @Get('org/members/:userId')
  @RequirePermission(PermissionResource.USER, PermissionAction.READ)
  getMember(
    @CurrentUser() user: AuthenticatedUser,
    @Param('userId') userId: string,
  ) {
    return this.usersService.getById(requireOrgId(user.orgId), userId);
  }

  @Patch('org/members/:userId')
  @UseGuards(OrgAdminGuard)
  @OrgAdminOnly()
  @RequirePermission(PermissionResource.USER, PermissionAction.UPDATE)
  updateMember(
    @CurrentUser() user: AuthenticatedUser,
    @Param('userId') userId: string,
    @Body(new ZodValidationPipe(UpdateMemberSchema))
    dto: UpdateMemberInput,
  ) {
    return this.usersService.updateMember(requireOrgId(user.orgId), userId, dto);
  }

  @Post('org/members/invite')
  @UseGuards(OrgAdminGuard)
  @OrgAdminOnly()
  inviteMember(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(InviteUserSchema))
    dto: InviteUserInput,
  ) {
    return this.usersService.inviteMember(requireOrgId(user.orgId), user.id, dto);
  }

  @UseGuards(OrgAdminGuard)
  @Post('/org/create')
  createOrg(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(CreateOrganizationSchema))
    dto: CreateOrganizationInput,
  ) {
    return this.usersService.createOrg(user.id, dto);
  }
}
