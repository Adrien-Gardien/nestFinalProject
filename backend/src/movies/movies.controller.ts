import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { SearchMoviesDto } from './dto/search-movies.dto';
import { TmdbGenre, TmdbMovieDetail, TmdbMovieListResponse } from './entities/tmdb-movie.entity';
import { MoviesService } from './movies.service';

@ApiTags('movies')
@Public()
@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  @ApiOperation({ summary: 'Recherche et découverte de films via TMDb' })
  @ApiOkResponse({ type: TmdbMovieListResponse })
  getMovies(@Query() query: SearchMoviesDto) {
    if (query.q) {
      return this.moviesService.search(query.q, query.page);
    }
    return this.moviesService.discover(query.sort, query.page, query.genre);
  }

  @Get('genres')
  @ApiOperation({ summary: 'Liste des genres de films (TMDb)' })
  @ApiOkResponse({ type: [TmdbGenre] })
  getGenres() {
    return this.moviesService.getGenres();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail complet d\'un film par ID TMDb' })
  @ApiOkResponse({ type: TmdbMovieDetail })
  @ApiNotFoundResponse({ description: 'Film introuvable sur TMDb' })
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.moviesService.getById(id);
  }
}
