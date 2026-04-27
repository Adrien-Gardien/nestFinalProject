import { Module } from '@nestjs/common';
import { MoviesModule } from '../movies/movies.module';
import { WatchlistController } from './watchlist.controller';
import { WatchlistService } from './watchlist.service';

@Module({
  imports: [MoviesModule],
  controllers: [WatchlistController],
  providers: [WatchlistService],
  exports: [WatchlistService],
})
export class WatchlistModule {}
