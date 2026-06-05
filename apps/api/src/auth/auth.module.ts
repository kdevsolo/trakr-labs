import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './guards/jwt.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { ProjectMemberGuard } from './guards/project-member.guard';
import { OrgAdminGuard } from './guards/org-admin.guard';
import { SupabaseStrategy } from './strategies/supabase.strategy';
import { AuthService } from './auth.service';
import { PermissionsService } from './permissions.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PassportModule,
    ConfigModule,
    PrismaModule,
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    PermissionsService,
    JwtAuthGuard,
    PermissionsGuard,
    ProjectMemberGuard,
    OrgAdminGuard,
    SupabaseStrategy,
  ],
  exports: [
    AuthService,
    PermissionsService,
    JwtAuthGuard,
    PermissionsGuard,
    ProjectMemberGuard,
    OrgAdminGuard,
  ],
})
export class AuthModule {}
