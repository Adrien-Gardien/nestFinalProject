import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { UserRole } from '../users/entities/user.entity';
import { CreateWatchlistItemDto } from './dto/create-watchlist-item.dto';
import { WatchlistService } from './watchlist.service';

@ApiTags('watchlist')
@ApiBearerAuth()
@Controller('watchlist')
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @Get('me')
  @ApiOperation({ summary: 'Ma watchlist perso' })
  getMyWatchlist(@CurrentUser() user: AuthUser) {
    return this.watchlistService.getForUser(user.id);
  }

  @Post('me')
  @ApiOperation({ summary: 'Ajouter un film dans ma watchlist' })
  addMovieToMine(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateWatchlistItemDto,
  ) {
    return this.watchlistService.addForUser(user.id, dto);
  }

  @Get('admin/all')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Voir toutes les watchlists (admin seulement)' })
  getAllForAdmin() {
    return this.watchlistService.getAllForAdmin();
  }
}
