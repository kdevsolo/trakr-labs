import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtAuthGuard } from './guards/jwt.guard'
import { SupabaseStrategy } from './strategies/supabase.strategy'

@Module({
  imports: [
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
    // Use the JWT_SECRET from the environment variables and inject the ConfigService
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  // The JwtAuthGuard and SupabaseStrategy are used to protect routes and validate the user's token
  providers: [JwtAuthGuard, SupabaseStrategy],
  // The JwtAuthGuard is exported to be used in the controllers
  exports: [JwtAuthGuard],
})
export class AuthModule {}