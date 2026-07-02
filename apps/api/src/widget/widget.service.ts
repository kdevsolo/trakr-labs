import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  RequestUploadUrlInput,
  SubmitAutoReportInput,
  SubmitFeedbackInput,
  UpdateWidgetSettingsInput,
  UploadUrlResponse,
} from '@trakr/schemas';
import { randomUUID } from 'crypto';
import { getSupabaseAdmin } from 'src/auth/supabase-admin';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ALLOWED_WIDGET_IMAGE_TYPES,
  WIDGET_MAX_FILE_SIZE_BYTES,
  WIDGET_MAX_MEDIA_COUNT,
  WIDGET_STORAGE_BUCKET,
} from './constants/widget.constants';
import { WidgetProjectContext } from './interfaces/widget-project-context.interface';
import { sanitizeFileName } from './utils/sanitize-file-name';
import {
  generateWidgetSecret,
  hashWidgetSecret,
} from './utils/generate-widget-secret';
import {
  decryptWidgetSecret,
  encryptWidgetSecret,
} from './utils/encrypt-widget-secret';
import {
  buildPublicStorageUrl,
  isValidWidgetMediaUrl,
} from './utils/validate-media-url';

@Injectable()
export class WidgetService {
  private readonly supabaseUrl = process.env.SUPABASE_URL ?? '';

  constructor(private readonly prisma: PrismaService) {}

  async createUploadUrl(
    context: WidgetProjectContext,
    dto: RequestUploadUrlInput,
  ): Promise<UploadUrlResponse> {
    if (!this.supabaseUrl) {
      throw new BadRequestException('Storage is not configured');
    }

    if (dto.fileSize > WIDGET_MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException(
        `File size exceeds ${WIDGET_MAX_FILE_SIZE_BYTES} bytes`,
      );
    }

    if (
      !ALLOWED_WIDGET_IMAGE_TYPES.includes(
        dto.fileType as (typeof ALLOWED_WIDGET_IMAGE_TYPES)[number],
      )
    ) {
      throw new BadRequestException('Unsupported file type');
    }

    const uploadId = randomUUID();
    const path = `${context.projectId}/${uploadId}/${sanitizeFileName(dto.fileName)}`;

    const { data, error } = await getSupabaseAdmin()
      .storage.from(WIDGET_STORAGE_BUCKET)
      .createSignedUploadUrl(path);

    if (error || !data?.signedUrl) {
      throw new BadRequestException(
        error?.message ?? 'Failed to create upload URL',
      );
    }

    return {
      uploadUrl: data.signedUrl,
      publicUrl: buildPublicStorageUrl(
        this.supabaseUrl,
        WIDGET_STORAGE_BUCKET,
        path,
      ),
      path,
    };
  }

  async submitFeedback(
    context: WidgetProjectContext,
    dto: SubmitFeedbackInput,
    serverContext?: { userAgent?: string },
  ): Promise<{ id: string }> {
    const media = dto.media ?? [];

    if (media.length > WIDGET_MAX_MEDIA_COUNT) {
      throw new BadRequestException(
        `Maximum ${WIDGET_MAX_MEDIA_COUNT} media files allowed`,
      );
    }

    for (const item of media) {
      if (
        !isValidWidgetMediaUrl(item.url, context.projectId, this.supabaseUrl)
      ) {
        throw new BadRequestException('Invalid media URL');
      }
    }

    const openStatus = await this.prisma.statusMaster.findFirst({
      where: { orgId: context.orgId, title: 'Open', active: true },
      select: { id: true },
    });

    if (!openStatus) {
      throw new BadRequestException(
        'Project is not configured for feedback (missing Open status)',
      );
    }

    const issue = await this.prisma.$transaction(async (tx) => {
      const created = await tx.issue.create({
        data: {
          title: dto.title,
          description: dto.description,
          statusId: openStatus?.id,
          projectId: context.projectId,
          metadata: {
            source: 'widget',
            reportType: 'manual',
            email: dto.email,
            pageUrl: dto.pageUrl ?? null,
            submittedAt: new Date().toISOString(),
            ...(dto.context ? { context: dto.context } : {}),
            ...(serverContext?.userAgent
              ? { server: { userAgent: serverContext.userAgent } }
              : {}),
          },
        },
      });

      if (media.length > 0) {
        await tx.issueMedia.createMany({
          data: media.map((item) => ({
            issueId: created.id,
            url: item.url,
            fileType: item.fileType ?? null,
          })),
        });
      }

      return created;
    });

    return { id: issue.id };
  }

  async submitAutoReport(
    context: WidgetProjectContext,
    dto: SubmitAutoReportInput,
    serverContext?: { userAgent?: string },
  ): Promise<{ id: string; deduplicated: boolean }> {
    const project = await this.prisma.project.findFirst({
      where: { id: context.projectId },
      select: {
        widgetAutoCrashReport: true,
        widgetAutoNetworkReport: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (dto.type === 'crash' && !project.widgetAutoCrashReport) {
      throw new BadRequestException('Automatic crash reporting is disabled');
    }

    if (dto.type === 'network' && !project.widgetAutoNetworkReport) {
      throw new BadRequestException('Automatic network reporting is disabled');
    }

    const now = new Date();
    const dedupSince = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const existing = await this.prisma.issue.findFirst({
      where: {
        projectId: context.projectId,
        metadata: {
          path: ['fingerprint'],
          equals: dto.fingerprint,
        },
        updatedAt: { gte: dedupSince },
      },
      select: { id: true, metadata: true },
    });

    if (existing) {
      const metadata =
        existing.metadata && typeof existing.metadata === 'object'
          ? (existing.metadata as Record<string, unknown>)
          : {};
      const occurrenceCount =
        typeof metadata.occurrenceCount === 'number'
          ? metadata.occurrenceCount + 1
          : 2;

      await this.prisma.issue.update({
        where: { id: existing.id },
        data: {
          metadata: {
            ...metadata,
            occurrenceCount,
            lastSeenAt: now.toISOString(),
            ...(dto.context ? { context: dto.context } : {}),
            ...(dto.pageUrl ? { pageUrl: dto.pageUrl } : {}),
            ...(serverContext?.userAgent
              ? {
                  server: {
                    ...(typeof metadata.server === 'object' && metadata.server
                      ? metadata.server
                      : {}),
                    userAgent: serverContext.userAgent,
                  },
                }
              : {}),
          },
        },
      });

      return { id: existing.id, deduplicated: true };
    }

    const openStatus = await this.prisma.statusMaster.findFirst({
      where: { orgId: context.orgId, title: 'Open', active: true },
      select: { id: true },
    });

    if (!openStatus) {
      throw new BadRequestException(
        'Project is not configured for feedback (missing Open status)',
      );
    }

    const issue = await this.prisma.issue.create({
      data: {
        title: dto.title,
        description: dto.description,
        statusId: openStatus.id,
        projectId: context.projectId,
        metadata: {
          source: 'widget',
          reportType: 'auto',
          autoType: dto.type,
          fingerprint: dto.fingerprint,
          sessionId: dto.sessionId,
          occurrenceCount: 1,
          firstSeenAt: now.toISOString(),
          lastSeenAt: now.toISOString(),
          pageUrl: dto.pageUrl ?? null,
          submittedAt: now.toISOString(),
          context: dto.context,
          ...(serverContext?.userAgent
            ? { server: { userAgent: serverContext.userAgent } }
            : {}),
        },
      },
    });

    return { id: issue.id, deduplicated: false };
  }

  async getRuntimeConfig(context: WidgetProjectContext) {
    const project = await this.prisma.project.findFirst({
      where: { id: context.projectId },
      select: {
        projectKey: true,
        widgetAutoCrashReport: true,
        widgetAutoNetworkReport: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return {
      projectKey: project.projectKey,
      autoCrashReport: project.widgetAutoCrashReport,
      autoNetworkReport: project.widgetAutoNetworkReport,
    };
  }

  async getConfig(projectId: string, orgId: string) {
    const project = await this.findProjectInOrg(projectId, orgId);

    return {
      projectKey: project.projectKey,
      enabled: project.widgetEnabled,
      hasSecret: Boolean(project.widgetSecretHash),
      widgetSecret: this.decryptStoredWidgetSecret(project.widgetSecretEnc),
      autoCrashReport: project.widgetAutoCrashReport,
      autoNetworkReport: project.widgetAutoNetworkReport,
    };
  }

  async updateSettings(
    projectId: string,
    orgId: string,
    userId: string,
    dto: UpdateWidgetSettingsInput,
  ) {
    await this.findProjectInOrg(projectId, orgId);

    const project = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        ...(dto.autoCrashReport !== undefined
          ? { widgetAutoCrashReport: dto.autoCrashReport }
          : {}),
        ...(dto.autoNetworkReport !== undefined
          ? { widgetAutoNetworkReport: dto.autoNetworkReport }
          : {}),
        modifiedBy: userId,
      },
      select: {
        projectKey: true,
        widgetEnabled: true,
        widgetSecretHash: true,
        widgetSecretEnc: true,
        widgetAutoCrashReport: true,
        widgetAutoNetworkReport: true,
      },
    });

    return {
      projectKey: project.projectKey,
      enabled: project.widgetEnabled,
      hasSecret: Boolean(project.widgetSecretHash),
      widgetSecret: this.decryptStoredWidgetSecret(project.widgetSecretEnc),
      autoCrashReport: project.widgetAutoCrashReport,
      autoNetworkReport: project.widgetAutoNetworkReport,
    };
  }

  async enableWidget(projectId: string, orgId: string, userId: string) {
    await this.findProjectInOrg(projectId, orgId);

    const widgetSecret = generateWidgetSecret();

    const project = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        widgetEnabled: true,
        widgetSecretHash: hashWidgetSecret(widgetSecret),
        widgetSecretEnc: encryptWidgetSecret(widgetSecret),
        modifiedBy: userId,
      },
      select: { projectKey: true, widgetEnabled: true },
    });

    return {
      projectKey: project.projectKey,
      widgetSecret,
      enabled: project.widgetEnabled,
    };
  }

  async rotateSecret(projectId: string, orgId: string, userId: string) {
    await this.findProjectInOrg(projectId, orgId);

    const widgetSecret = generateWidgetSecret();

    const project = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        widgetSecretHash: hashWidgetSecret(widgetSecret),
        widgetSecretEnc: encryptWidgetSecret(widgetSecret),
        modifiedBy: userId,
      },
      select: { projectKey: true, widgetEnabled: true },
    });

    return {
      projectKey: project.projectKey,
      widgetSecret,
      enabled: project.widgetEnabled,
    };
  }

  async disableWidget(projectId: string, orgId: string, userId: string) {
    await this.findProjectInOrg(projectId, orgId);

    const project = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        widgetEnabled: false,
        modifiedBy: userId,
      },
      select: { projectKey: true, widgetEnabled: true, widgetSecretHash: true },
    });

    return {
      projectKey: project.projectKey,
      enabled: project.widgetEnabled,
      hasSecret: Boolean(project.widgetSecretHash),
    };
  }

  private async findProjectInOrg(projectId: string, orgId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, orgId },
      select: {
        id: true,
        projectKey: true,
        widgetEnabled: true,
        widgetSecretHash: true,
        widgetSecretEnc: true,
        widgetAutoCrashReport: true,
        widgetAutoNetworkReport: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found in this organization');
    }

    return project;
  }

  private decryptStoredWidgetSecret(
    widgetSecretEnc: string | null,
  ): string | undefined {
    if (!widgetSecretEnc) {
      return undefined;
    }

    try {
      return decryptWidgetSecret(widgetSecretEnc);
    } catch {
      return undefined;
    }
  }
}
