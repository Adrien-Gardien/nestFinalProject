import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { UserRole } from '../users/entities/user.entity';
import { CreateWatchlistItemDto } from './dto/create-watchlist-item.dto';
import { UpdateWatchlistItemDto } from './dto/update-watchlist-item.dto';
import { WatchlistItemEntity } from './entities/watchlist-item.entity';
import { WatchlistStatsEntity } from './entities/watchlist-stats.entity';
import { WatchlistService } from './watchlist.service';

@ApiTags('watchlist')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Token manquant ou invalide' })
@Controller('watchlist')
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @Get('me')
  @ApiOperation({ summary: 'Ma watchlist perso' })
  @ApiOkResponse({ type: [WatchlistItemEntity] })
  getMyWatchlist(@CurrentUser() user: AuthUser) {
    return this.watchlistService.getForUser(user.id);
  }

  @Get('me/stats')
  @ApiOperation({ summary: 'Statistiques de ma watchlist' })
  @ApiOkResponse({ type: WatchlistStatsEntity })
  getMyStats(@CurrentUser() user: AuthUser) {
    return this.watchlistService.getStatsForUser(user.id);
  }

  @Post('me')
  @ApiOperation({ summary: 'Ajouter un film dans ma watchlist' })
  @ApiCreatedResponse({ type: WatchlistItemEntity })
  addMovieToMine(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateWatchlistItemDto,
  ) {
    return this.watchlistService.addForUser(user.id, dto);
  }

  @Patch('me/:id')
  @ApiOperation({ summary: 'Marquer un film comme vu (ou non)' })
  @ApiOkResponse({ type: WatchlistItemEntity })
  updateMine(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateWatchlistItemDto,
  ) {
    return this.watchlistService.updateForUser(user.id, id, dto);
  }

  @Delete('me/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un film de ma watchlist' })
  @ApiNoContentResponse({ description: 'Film supprimé' })
  removeMine(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.watchlistService.removeForUser(user.id, id);
  }

  @Get('admin/all')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Voir toutes les watchlists (admin seulement)' })
  @ApiOkResponse({ type: [WatchlistItemEntity] })
  @ApiForbiddenResponse({ description: 'Réservé aux administrateurs' })
  getAllForAdmin() {
    return this.watchlistService.getAllForAdmin();
  }
}
