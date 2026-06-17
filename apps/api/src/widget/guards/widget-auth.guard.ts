import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  WIDGET_PROJECT_KEY_HEADER,
  WIDGET_SECRET_HEADER,
} from '../constants/widget.constants';
import { WidgetProjectContext } from '../interfaces/widget-project-context.interface';
import { verifyWidgetSecret } from '../utils/generate-widget-secret';

@Injectable()
export class WidgetAuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      widgetProject?: WidgetProjectContext;
    }>();

    const projectKey = this.getHeader(request.headers, WIDGET_PROJECT_KEY_HEADER);
    const widgetSecret = this.getHeader(request.headers, WIDGET_SECRET_HEADER);

    if (!projectKey || !widgetSecret) {
      throw new UnauthorizedException('Widget credentials required');
    }

    const project = await this.prisma.project.findFirst({
      where: { projectKey, widgetEnabled: true },
      select: {
        id: true,
        orgId: true,
        createdBy: true,
        projectKey: true,
        widgetSecretHash: true,
      },
    });

    if (!project || !verifyWidgetSecret(widgetSecret, project.widgetSecretHash)) {
      throw new UnauthorizedException('Invalid widget credentials');
    }

    request.widgetProject = {
      projectId: project.id,
      orgId: project.orgId,
      createdBy: project.createdBy,
      projectKey: project.projectKey,
    };

    return true;
  }

  private getHeader(
    headers: Record<string, string | string[] | undefined>,
    name: string,
  ): string | undefined {
    const value = headers[name] ?? headers[name.toLowerCase()];
    return Array.isArray(value) ? value[0] : value;
  }
}
