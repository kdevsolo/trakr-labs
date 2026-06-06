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
  PermissionAction,
  PermissionResource,
} from '../generated/prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OrgAdminOnly } from '../auth/decorators/org-admin.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { OrgAdminGuard } from '../auth/guards/org-admin.guard';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { requireOrgId } from '../auth/utils/require-org-id';
import { CreateOrgDto } from './dto/create-org.dto';

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
    @Body() dto: UpdateProfileDto,
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
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateMember(requireOrgId(user.orgId), userId, dto);
  }

  @UseGuards(OrgAdminGuard)
  @Post('/org/create')
  createOrg(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateOrgDto) {
    return this.usersService.createOrg(user.id, dto);
  }
}
