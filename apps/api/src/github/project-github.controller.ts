import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { LinkRepoSchema, type LinkRepoInput } from '@trakr/schemas';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { RequirePermission } from 'src/auth/decorators/require-permission.decorator';
import { ProjectScoped } from 'src/auth/decorators/project-scoped.decorator';
import { ProjectMemberGuard } from 'src/auth/guards/project-member.guard';
import { PermissionAction, PermissionResource } from 'src/generated/prisma/enums';
import { requireOrgId } from 'src/auth/utils/require-org-id';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { UuidParamPipe } from 'src/common/pipes/uuid-param.pipe';
import { GithubService } from './github.service';

@Controller('projects/:projectId/github')
@ProjectScoped()
@UseGuards(ProjectMemberGuard)
export class ProjectGithubController {
  constructor(private readonly githubService: GithubService) {}

  @Get()
  @RequirePermission(PermissionResource.PROJECT, PermissionAction.READ, 'project')
  getConnection(
    @Param('projectId', UuidParamPipe) projectId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.githubService.getConnection(projectId, requireOrgId(user.orgId));
  }

  @Get('available-repos')
  @RequirePermission(PermissionResource.PROJECT, PermissionAction.UPDATE, 'project')
  getAvailableRepos(
    @Param('projectId', UuidParamPipe) projectId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.githubService.listAvailableRepos(requireOrgId(user.orgId));
  }

  @Post('link')
  @RequirePermission(PermissionResource.PROJECT, PermissionAction.UPDATE, 'project')
  linkRepo(
    @Param('projectId', UuidParamPipe) projectId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(LinkRepoSchema)) dto: LinkRepoInput,
  ) {
    return this.githubService.linkRepo(
      projectId,
      requireOrgId(user.orgId),
      user.id,
      dto,
    );
  }

  @Post('unlink')
  @RequirePermission(PermissionResource.PROJECT, PermissionAction.UPDATE, 'project')
  unlink(
    @Param('projectId', UuidParamPipe) projectId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.githubService.unlink(projectId, requireOrgId(user.orgId));
  }
}
