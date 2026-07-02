import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  RequestUploadUrlSchema,
  SubmitAutoReportSchema,
  SubmitFeedbackSchema,
  type RequestUploadUrlInput,
  type SubmitAutoReportInput,
  type SubmitFeedbackInput,
} from '@trakr/schemas';
import type { Request } from 'express';
import { Public } from 'src/auth/decorators/public.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { WidgetAuthGuard } from './guards/widget-auth.guard';
import { WidgetProjectContext } from './interfaces/widget-project-context.interface';
import { WidgetService } from './widget.service';

type WidgetRequest = Request & {
  widgetProject: WidgetProjectContext;
};

@Controller('widget')
@Public()
@UseGuards(WidgetAuthGuard)
export class WidgetController {
  constructor(private readonly widgetService: WidgetService) {}

  @Post('upload-url')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  createUploadUrl(
    @Req() request: WidgetRequest,
    @Body(new ZodValidationPipe(RequestUploadUrlSchema))
    dto: RequestUploadUrlInput,
  ) {
    return this.widgetService.createUploadUrl(request.widgetProject, dto);
  }

  @Post('feedback')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  submitFeedback(
    @Req() request: WidgetRequest,
    @Body(new ZodValidationPipe(SubmitFeedbackSchema))
    dto: SubmitFeedbackInput,
  ) {
    const userAgent = request.headers['user-agent'];
    return this.widgetService.submitFeedback(request.widgetProject, dto, {
      userAgent: typeof userAgent === 'string' ? userAgent : undefined,
    });
  }

  @Get('config')
  getRuntimeConfig(@Req() request: WidgetRequest) {
    return this.widgetService.getRuntimeConfig(request.widgetProject);
  }

  @Post('report')
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  submitAutoReport(
    @Req() request: WidgetRequest,
    @Body(new ZodValidationPipe(SubmitAutoReportSchema))
    dto: SubmitAutoReportInput,
  ) {
    const userAgent = request.headers['user-agent'];
    return this.widgetService.submitAutoReport(request.widgetProject, dto, {
      userAgent: typeof userAgent === 'string' ? userAgent : undefined,
    });
  }
}
