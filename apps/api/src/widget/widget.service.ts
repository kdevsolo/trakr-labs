import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  RequestUploadUrlInput,
  SubmitFeedbackInput,
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
          statusId: openStatus.id,
          projectId: context.projectId,
          reportedBy: context.createdBy,
          modifiedBy: context.createdBy,
          metadata: {
            source: 'widget',
            email: dto.email ?? null,
            pageUrl: dto.pageUrl ?? null,
            submittedAt: new Date().toISOString(),
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

  async getConfig(projectId: string, orgId: string) {
    const project = await this.findProjectInOrg(projectId, orgId);

    return {
      projectKey: project.projectKey,
      enabled: project.widgetEnabled,
      hasSecret: Boolean(project.widgetSecretHash),
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
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found in this organization');
    }

    return project;
  }
}
