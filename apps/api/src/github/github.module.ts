import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { GithubAppService } from './github-app';
import { GithubInstallController } from './github-install.controller';
import { GithubService } from './github.service';
import { ProjectGithubController } from './project-github.controller';

@Module({
  imports: [AuthModule],
  controllers: [GithubInstallController, ProjectGithubController],
  providers: [GithubService, GithubAppService],
  exports: [GithubService],
})
export class GithubModule {}
