import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type {
  CreateOrganizationInput,
  InviteUserInput,
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
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class UsersService {
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

  listByOrg(orgId: string) {
    return this.prisma.user.findMany({
      where: { orgId },
      select: userSelect,
      orderBy: { name: 'asc' },
    });
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

  async createOrg(userId: string, dto: CreateOrganizationInput) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    if (user.orgId) {
      throw new BadRequestException('User already belongs to an organization');
    }

    if (user.isOrgAdmin) {
      throw new BadRequestException('User is already an organization admin');
    }

    return this.prisma.organization.create({
      data: {
        name: dto.name,
        ownerId: userId,
        createdBy: userId,
        modifiedBy: userId,
      },
    });
  }

  async inviteMember(orgId: string, adminId: string, dto: InviteUserInput) {
    const { data, error } = await getSupabaseAdmin().auth.admin.inviteUserByEmail(
      dto.email,
    );

    if (error) {
      throw new BadRequestException(error.message);
    }

    const uid = data.user.id;

    await this.prisma.$transaction([
      this.prisma.user.create({
        data: { id: uid, name: dto.name, email: dto.email, orgId },
      }),
      ...dto.permissions.map((p) =>
        this.prisma.memberPermission.create({
          data: {
            userId: uid,
            orgId,
            projectId: p.projectId ?? null,
            resource: p.resource,
            action: p.action,
            grantedBy: adminId,
          },
        }),
      ),
      this.prisma.userInvite.create({
        data: { userId: uid, orgId, invitedBy: adminId },
      }),
    ]);

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
