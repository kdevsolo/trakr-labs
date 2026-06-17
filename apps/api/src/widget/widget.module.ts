import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { WidgetAuthGuard } from './guards/widget-auth.guard';
import { ProjectWidgetController } from './project-widget.controller';
import { WidgetController } from './widget.controller';
import { WidgetService } from './widget.service';

@Module({
  imports: [AuthModule],
  controllers: [WidgetController, ProjectWidgetController],
  providers: [WidgetService, WidgetAuthGuard],
  exports: [WidgetService],
})
export class WidgetModule {}
