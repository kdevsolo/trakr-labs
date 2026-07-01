import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import type {
  InviteUserInput,
  PaginationQuery,
  UpdateMemberInput,
  UpdateProfileInput,
} from '@trakr/schemas';
import { PermissionsService } from '../auth/permissions.service';
import { getSupabaseAdmin } from '../auth/supabase-admin';
import { PrismaService } from '../prisma/prisma.service';

const userSelect = {
  id: true,
  name: true,
  email: true,
  orgId: true,
  isOrgAdmin: true,
  tncAccepted: true,
  tncAcceptingTimestamp: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly permissionsService: PermissionsService,
  ) {}

  getMe(userId: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: userSelect,
    });
  }

  updateProfile(userId: string, dto: UpdateProfileInput) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { name: dto.name },
      select: userSelect,
    });
  }

  async acceptTerms(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { tncAccepted: true },
    });

    if (user.tncAccepted) {
      return this.getMe(userId);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        tncAccepted: true,
        tncAcceptingTimestamp: new Date(),
      },
      select: userSelect,
    });
  }

  async listByOrg(orgId: string, query: PaginationQuery) {
    const { page, pageSize } = query;
    const skip = (page - 1) * pageSize;

    const where = { orgId };

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: userSelect,
        orderBy: { name: 'asc' },
        skip,
        take: pageSize,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items,
      meta: { page, pageSize, total },
    };
  }

  async getById(orgId: string, userId: string) {
    return this.assertUserInOrg(orgId, userId);
  }

  async updateMember(orgId: string, userId: string, dto: UpdateMemberInput) {
    await this.assertUserInOrg(orgId, userId);

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name,
        isOrgAdmin: dto.isOrgAdmin,
      },
      select: userSelect,
    });

    if (dto.isOrgAdmin !== undefined) {
      this.permissionsService.invalidateUserCache(userId);
    }

    return updated;
  }

  async inviteMember(orgId: string, adminId: string, dto: InviteUserInput) {
    const frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl) {
      throw new BadRequestException('FRONTEND_URL is not configured');
    }

    const redirectTo = `${frontendUrl}/auth/callback?next=/auth/set-password`;
    const { data, error } = await getSupabaseAdmin().auth.admin.inviteUserByEmail(
      dto.email,
      { redirectTo },
    );

    if (error) {
      this.logger.warn(`Supabase invite failed for ${dto.email}: ${error.message}`);
      throw new BadRequestException('Failed to send invite. Please try again.');
    }

    const uid = data.user.id;

    await this.permissionsService.validateInviteGrants(orgId, dto.permissions);

    await this.prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: { id: uid, name: dto.name, email: dto.email, orgId },
      });

      if (dto.permissions.length > 0) {
        await tx.memberPermission.createMany({
          data: dto.permissions.map((p) => ({
            userId: uid,
            orgId,
            projectId: p.projectId ?? null,
            resource: p.resource,
            action: p.action,
            grantedBy: adminId,
          })),
        });
      }

      await tx.userInvite.create({
        data: { userId: uid, orgId, invitedBy: adminId },
      });
    });

    return { id: uid };
  }

  private async assertUserInOrg(orgId: string, userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, orgId },
      select: userSelect,
    });

    if (!user) {
      throw new NotFoundException('Member not found in this organization');
    }

    return user;
  }
}
