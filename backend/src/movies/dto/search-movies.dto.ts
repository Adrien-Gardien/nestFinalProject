import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

// Adrien : DTO pour les query params de GET /movies
// q → recherche texte, sort → tri discover, genre → filtre par genre TMDb, page → pagination
export class SearchMoviesDto {
  @ApiPropertyOptional({ example: 'Dune', description: 'Recherche par titre' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    example: 'popularity.desc',
    description: 'Critère de tri TMDb (ignoré si q est fourni)',
    enum: ['popularity.desc', 'vote_average.desc', 'primary_release_date.desc', 'revenue.desc'],
  })
  @IsOptional()
  @IsString()
  sort?: string = 'popularity.desc';

  @ApiPropertyOptional({ example: 28, description: 'ID du genre TMDb (ignoré si q est fourni)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  genre?: number;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;
}
