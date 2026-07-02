import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { App } from '@octokit/app';
import { Octokit } from 'octokit';
import { createHmac, timingSafeEqual } from 'crypto';

export interface GithubInstallState {
  orgId: string;
  userId: string;
}

const STATE_TTL_MS = 10 * 60 * 1000;

@Injectable()
export class GithubAppService {
  private cachedApp: App | null = null;

  constructor(private readonly config: ConfigService) {}

  private requireConfig(key: string): string {
    const value = this.config.get<string>(key);
    if (!value) {
      throw new ServiceUnavailableException(
        `GitHub connector is not configured (missing ${key})`,
      );
    }
    return value;
  }

  private get app(): App {
    if (!this.cachedApp) {
      this.cachedApp = new App({
        appId: this.requireConfig('GITHUB_APP_ID'),
        privateKey: this.requireConfig('GITHUB_APP_PRIVATE_KEY').replace(
          /\\n/g,
          '\n',
        ),
        Octokit,
      });
    }
    return this.cachedApp;
  }

  buildInstallUrl(state: string): string {
    const slug = this.requireConfig('GITHUB_APP_SLUG');
    const params = new URLSearchParams({ state });
    return `https://github.com/apps/${slug}/installations/new?${params.toString()}`;
  }

  async getInstallationOctokit(installationId: number): Promise<Octokit> {
    try {
      return (await this.app.getInstallationOctokit(
        installationId,
      )) as unknown as Octokit;
    } catch {
      throw new InternalServerErrorException(
        'Failed to authenticate with GitHub installation',
      );
    }
  }

  async getInstallationInfo(installationId: number): Promise<{
    accountLogin: string;
    accountType: string;
  }> {
    const { data } = await this.app.octokit.request(
      'GET /app/installations/{installation_id}',
      { installation_id: installationId },
    );

    const account = data.account;
    const accountLogin =
      account && 'login' in account
        ? account.login
        : (account && 'name' in account ? account.name : null) ?? 'unknown';
    const accountType =
      account && 'type' in account ? account.type : 'Organization';

    return { accountLogin, accountType };
  }

  createState(payload: GithubInstallState): string {
    const body = JSON.stringify({ ...payload, exp: Date.now() + STATE_TTL_MS });
    const encoded = Buffer.from(body).toString('base64url');
    const signature = this.sign(encoded);
    return `${encoded}.${signature}`;
  }

  verifyState(state: string): GithubInstallState | null {
    const [encoded, signature] = state.split('.');
    if (!encoded || !signature) {
      return null;
    }

    const expected = this.sign(encoded);
    if (!this.safeEqual(signature, expected)) {
      return null;
    }

    try {
      const parsed = JSON.parse(
        Buffer.from(encoded, 'base64url').toString('utf8'),
      ) as GithubInstallState & { exp: number };

      if (!parsed.exp || parsed.exp < Date.now()) {
        return null;
      }

      if (!parsed.orgId || !parsed.userId) {
        return null;
      }

      return { orgId: parsed.orgId, userId: parsed.userId };
    } catch {
      return null;
    }
  }

  private sign(value: string): string {
    const secret = this.requireConfig('GITHUB_STATE_SECRET');
    return createHmac('sha256', secret).update(value).digest('hex');
  }

  private safeEqual(a: string, b: string): boolean {
    const bufferA = Buffer.from(a);
    const bufferB = Buffer.from(b);
    if (bufferA.length !== bufferB.length) {
      return false;
    }
    return timingSafeEqual(bufferA, bufferB);
  }
}
