import { Injectable, NotFoundException } from '@nestjs/common';
import { PermissionsService } from '../auth/permissions.service';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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

  updateProfile(userId: string, dto: UpdateProfileDto) {
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

  async updateMember(orgId: string, userId: string, dto: UpdateUserDto) {
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
