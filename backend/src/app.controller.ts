import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';

@ApiTags('app')
@Controller()
export class AppController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'Point de santé de l\'API' })
  @ApiOkResponse({ schema: { example: { message: 'Watchlist API en route', swagger: '/api/docs' } } })
  getHello() {
    return {
      message: 'Watchlist API en route',
      swagger: '/api/docs',
    };
  }
}
