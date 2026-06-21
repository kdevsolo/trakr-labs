import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';
import { SkipTransform } from './common/decorators/skip-transform.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @SkipTransform()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @SkipTransform()
  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }
}
