import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { SearchMoviesDto } from './dto/search-movies.dto';
import { MoviesService } from './movies.service';

// Adrien : toutes les routes /movies sont publiques (pas besoin d'être connecté pour parcourir les films)
@ApiTags('movies')
@Public()
@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  // Adrien : GET /movies?q=dune → recherche | GET /movies?sort=vote_average.desc&genre=28 → découverte triée
  @Get()
  @ApiOperation({ summary: 'Recherche et découverte de films via TMDb' })
  getMovies(@Query() query: SearchMoviesDto) {
    if (query.q) {
      return this.moviesService.search(query.q, query.page);
    }
    return this.moviesService.discover(query.sort, query.page, query.genre);
  }

  // Adrien : les genres sont nécessaires pour construire les filtres côté front
  @Get('genres')
  @ApiOperation({ summary: 'Liste des genres de films (TMDb)' })
  getGenres() {
    return this.moviesService.getGenres();
  }

  // Adrien : GET /movies/:id → fiche complète d'un film TMDb (durée, budget, genres…)
  @Get(':id')
  @ApiOperation({ summary: 'Détail complet d\'un film par ID TMDb' })
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.moviesService.getById(id);
  }
}
