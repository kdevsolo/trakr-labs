import { Module } from '@nestjs/common';
import { DashboardService } from '../dashboard/dashboard.service';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';

@Module({
  controllers: [OrganizationsController],
  providers: [OrganizationsService, DashboardService],
})
export class OrganizationsModule {}
