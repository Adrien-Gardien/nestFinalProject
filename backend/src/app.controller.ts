import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  @Public()
  @Get()
  getHello() {
    return {
      message: 'Watchlist API en route',
      swagger: '/api/docs',
    };
  }
}
