import { BadRequestException, Injectable } from '@nestjs/common';
import type { CreateOrganizationInput } from '@trakr/schemas';
import { DEFAULT_STATUSES } from 'src/common/constants/default-statuses';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createOrganizationDto: CreateOrganizationInput) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    if (user.orgId) {
      throw new BadRequestException('User already belongs to an organization');
    }

    return this.prisma.$transaction(async (tx) => {
      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: createOrganizationDto.name,
          ownerId: userId,
          createdBy: userId,
          modifiedBy: userId,
        },
      });

      // Add user to organization
      await tx.user.update({
        where: { id: userId },
        data: { orgId: organization.id, isOrgAdmin: true },
      });

      await tx.statusMaster.createMany({
        data: DEFAULT_STATUSES.map((status) => ({
          orgId: organization.id,
          title: status.title,
          sortOrder: status.sortOrder,
        })),
      });

      return organization;
    });
  }

  async getStatusMaster(orgId: string) {
    return this.prisma.statusMaster.findMany({
      where: { orgId },
      orderBy: {
        sortOrder: 'asc',
      },
    });
  }
}
