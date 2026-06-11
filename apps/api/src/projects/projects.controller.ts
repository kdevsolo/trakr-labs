import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { AddProjectMemberInput, AddProjectMemberSchema, CreateProjectSchema, type CreateProjectInput, type UpdateProjectInput } from '@trakr/schemas';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { RequirePermission } from 'src/auth/decorators/require-permission.decorator';
import { PermissionAction, PermissionResource } from 'src/generated/prisma/enums';
import { requireOrgId } from 'src/auth/utils/require-org-id';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) { }

  @Post()
  @RequirePermission(PermissionResource.PROJECT, PermissionAction.CREATE)
  create(@CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(CreateProjectSchema))
    createProjectDto: CreateProjectInput) {
    return this.projectsService.create(user.id, createProjectDto);
  }

  @Post('add-member')
  addProjectMember(@CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(AddProjectMemberSchema))
    addProjectMemberDto: AddProjectMemberInput) {
    return this.projectsService.addProjectMember(user.id, addProjectMemberDto);
  }

  @Get()
  @RequirePermission(PermissionResource.PROJECT, PermissionAction.READ)
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.projectsService.findAll(requireOrgId(user.orgId), user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectInput) {
    return this.projectsService.update(+id, updateProjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(+id);
  }
}
