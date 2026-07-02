import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { OrganizationsService } from './organizations.service';
import { DashboardService } from '../dashboard/dashboard.service';
import {
  CreateOrganizationSchema,
  DashboardQuerySchema,
  type CreateOrganizationInput,
  type DashboardQuery,
} from '@trakr/schemas';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { requireOrgId } from 'src/auth/utils/require-org-id';

@Controller('organizations')
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService,
    private readonly dashboardService: DashboardService,
  ) {}

  @Post()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(CreateOrganizationSchema))
    createOrganizationDto: CreateOrganizationInput,
  ) {
    return this.organizationsService.create(user.id, createOrganizationDto);
  }

  @Get('status-master')
  getStatusMaster(@CurrentUser() user: AuthenticatedUser) {
    return this.organizationsService.getStatusMaster(requireOrgId(user.orgId));
  }

  @Get('dashboard')
  getDashboard(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(DashboardQuerySchema))
    query: DashboardQuery,
  ) {
    return this.dashboardService.getDashboardSummary(
      requireOrgId(user.orgId),
      user.id,
      query,
    );
  }
}
