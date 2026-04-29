import { ApiProperty } from '@nestjs/swagger';

export class WatchlistStatsEntity {
  @ApiProperty({ example: 42 })
  total: number;

  @ApiProperty({ example: 30 })
  watched: number;

  @ApiProperty({ example: 12 })
  unwatched: number;

  @ApiProperty({ example: 2023, nullable: true })
  mostWatchedYear: number | null;
}
