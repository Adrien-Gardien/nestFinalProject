import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class CreateWatchlistItemDto {
  @ApiProperty({ example: 693134, description: 'ID TMDb du film à ajouter' })
  @IsInt()
  @Min(1)
  tmdbId!: number;
}
