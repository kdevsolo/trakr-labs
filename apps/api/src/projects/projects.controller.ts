import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import {
  AddProjectMemberInput,
  AddProjectMemberSchema,
  CreateProjectSchema,
  PaginationQuerySchema,
  type CreateProjectInput,
  type PaginationQuery,
} from '@trakr/schemas';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { UuidParamPipe } from 'src/common/pipes/uuid-param.pipe';
import { RequirePermission } from 'src/auth/decorators/require-permission.decorator';
import { OrgAdminOnly } from 'src/auth/decorators/org-admin.decorator';
import { ProjectScoped } from 'src/auth/decorators/project-scoped.decorator';
import { OrgAdminGuard } from 'src/auth/guards/org-admin.guard';
import { ProjectMemberGuard } from 'src/auth/guards/project-member.guard';
import { PermissionAction, PermissionResource } from 'src/generated/prisma/enums';
import { requireOrgId } from 'src/auth/utils/require-org-id';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @RequirePermission(PermissionResource.PROJECT, PermissionAction.CREATE)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(CreateProjectSchema))
    createProjectDto: CreateProjectInput,
  ) {
    return this.projectsService.create(
      user.id,
      requireOrgId(user.orgId),
      createProjectDto,
    );
  }

  @Post('add-member')
  @UseGuards(OrgAdminGuard)
  @OrgAdminOnly()
  addProjectMember(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(AddProjectMemberSchema))
    addProjectMemberDto: AddProjectMemberInput,
  ) {
    return this.projectsService.addProjectMember(user, addProjectMemberDto);
  }

  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(PaginationQuerySchema))
    query: PaginationQuery,
  ) {
    return this.projectsService.findAll(
      requireOrgId(user.orgId),
      user.id,
      query,
    );
  }

  @Get(':projectId')
  @ProjectScoped()
  @UseGuards(ProjectMemberGuard)
  @RequirePermission(PermissionResource.PROJECT, PermissionAction.READ, 'project')
  findOne(@Param('projectId', UuidParamPipe) projectId: string) {
    return this.projectsService.findOne(projectId);
  }
}
