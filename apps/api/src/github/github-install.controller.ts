import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { OrgAdminOnly } from 'src/auth/decorators/org-admin.decorator';
import { Public } from 'src/auth/decorators/public.decorator';
import { OrgAdminGuard } from 'src/auth/guards/org-admin.guard';
import { requireOrgId } from 'src/auth/utils/require-org-id';
import { SkipTransform } from 'src/common/decorators/skip-transform.decorator';
import { GithubService } from './github.service';

function firstFrontendUrl(): string {
  const raw = process.env.FRONTEND_URL ?? 'http://localhost:3000';
  return raw.split(',')[0]?.trim() || 'http://localhost:3000';
}

@Controller('github')
export class GithubInstallController {
  constructor(private readonly githubService: GithubService) {}

  @Get('install-url')
  @UseGuards(OrgAdminGuard)
  @OrgAdminOnly()
  getInstallUrl(@CurrentUser() user: AuthenticatedUser) {
    return this.githubService.getInstallUrl(requireOrgId(user.orgId), user.id);
  }

  @Get('setup')
  @Public()
  @SkipTransform()
  async setup(
    @Query('installation_id') installationId: string | undefined,
    @Query('state') state: string | undefined,
    @Res() res: Response,
  ) {
    const settingsUrl = `${firstFrontendUrl()}/dashboard/settings`;

    if (!installationId || !state) {
      return res.redirect(`${settingsUrl}?github=error`);
    }

    const parsedInstallationId = Number(installationId);
    if (!Number.isInteger(parsedInstallationId)) {
      throw new BadRequestException('Invalid installation_id');
    }

    try {
      await this.githubService.handleSetup(parsedInstallationId, state);
    } catch {
      return res.redirect(`${settingsUrl}?github=error`);
    }

    return res.redirect(`${settingsUrl}?github=connected`);
  }
}
