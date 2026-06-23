import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { IssuesController } from './issues.controller';
import { IssuesService } from './issues.service';

@Module({
  imports: [AuthModule],
  controllers: [IssuesController, CommentsController],
  providers: [IssuesService, CommentsService],
})
export class IssuesModule {}
