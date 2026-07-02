import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  AvailableRepo,
  GithubConnection,
  LinkRepoInput,
} from '@trakr/schemas';
import { PrismaService } from 'src/prisma/prisma.service';
import { GithubAppService } from './github-app';

@Injectable()
export class GithubService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly githubApp: GithubAppService,
  ) {}

  getInstallUrl(orgId: string, userId: string): { url: string } {
    const state = this.githubApp.createState({ orgId, userId });
    return { url: this.githubApp.buildInstallUrl(state) };
  }

  async handleSetup(installationId: number, state: string): Promise<void> {
    const payload = this.githubApp.verifyState(state);
    if (!payload) {
      throw new BadRequestException('Invalid or expired installation state');
    }

    const { accountLogin, accountType } =
      await this.githubApp.getInstallationInfo(installationId);

    await this.prisma.githubInstallation.upsert({
      where: { installationId },
      create: {
        installationId,
        orgId: payload.orgId,
        accountLogin,
        accountType,
        createdBy: payload.userId,
      },
      update: {
        orgId: payload.orgId,
        accountLogin,
        accountType,
      },
    });
  }

  async listAvailableRepos(orgId: string): Promise<AvailableRepo[]> {
    const installations = await this.prisma.githubInstallation.findMany({
      where: { orgId },
      select: { installationId: true },
    });

    if (installations.length === 0) {
      throw new BadRequestException('GitHub is not connected for this organization');
    }

    const repos: AvailableRepo[] = [];
    for (const installation of installations) {
      const octokit = await this.githubApp.getInstallationOctokit(
        installation.installationId,
      );
      const results = await octokit.paginate(
        'GET /installation/repositories',
        { per_page: 100 },
      );
      for (const repo of results) {
        repos.push({
          owner: repo.owner.login,
          name: repo.name,
          repoId: repo.id,
          defaultBranch: repo.default_branch,
          private: repo.private,
        });
      }
    }

    return repos.sort((a, b) =>
      `${a.owner}/${a.name}`.localeCompare(`${b.owner}/${b.name}`),
    );
  }

  async linkRepo(
    projectId: string,
    orgId: string,
    userId: string,
    input: LinkRepoInput,
  ): Promise<GithubConnection> {
    await this.assertProjectInOrg(projectId, orgId);

    const available = await this.listAvailableRepos(orgId);
    const match = available.find(
      (repo) =>
        repo.owner.toLowerCase() === input.repoOwner.toLowerCase() &&
        repo.name.toLowerCase() === input.repoName.toLowerCase(),
    );

    if (!match) {
      throw new BadRequestException(
        'Repository is not accessible by the GitHub installation',
      );
    }

    const installation = await this.prisma.githubInstallation.findFirst({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
      select: { installationId: true },
    });

    if (!installation) {
      throw new BadRequestException('GitHub is not connected for this organization');
    }

    await this.prisma.repoConnection.upsert({
      where: { projectId },
      create: {
        projectId,
        installationId: installation.installationId,
        repoOwner: match.owner,
        repoName: match.name,
        repoId: match.repoId,
        defaultBranch: match.defaultBranch,
        connectedBy: userId,
      },
      update: {
        installationId: installation.installationId,
        repoOwner: match.owner,
        repoName: match.name,
        repoId: match.repoId,
        defaultBranch: match.defaultBranch,
        connectedBy: userId,
      },
    });

    return this.getConnection(projectId, orgId);
  }

  async getConnection(
    projectId: string,
    orgId: string,
  ): Promise<GithubConnection> {
    await this.assertProjectInOrg(projectId, orgId);

    const [installation, connection] = await Promise.all([
      this.prisma.githubInstallation.findFirst({
        where: { orgId },
        select: { id: true },
      }),
      this.prisma.repoConnection.findUnique({
        where: { projectId },
        select: { repoOwner: true, repoName: true, defaultBranch: true },
      }),
    ]);

    return {
      installed: Boolean(installation),
      connected: Boolean(connection),
      repo: connection
        ? {
            owner: connection.repoOwner,
            name: connection.repoName,
            defaultBranch: connection.defaultBranch,
          }
        : null,
    };
  }

  async unlink(projectId: string, orgId: string): Promise<GithubConnection> {
    await this.assertProjectInOrg(projectId, orgId);

    await this.prisma.repoConnection.deleteMany({ where: { projectId } });

    return this.getConnection(projectId, orgId);
  }

  private async assertProjectInOrg(projectId: string, orgId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, orgId },
      select: { id: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found in this organization');
    }
  }
}
