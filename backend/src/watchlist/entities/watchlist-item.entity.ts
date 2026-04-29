import { ApiProperty } from '@nestjs/swagger';

export class WatchlistItemEntity {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  userId: string;

  @ApiProperty({ example: 693134, nullable: true })
  tmdbId: number | null;

  @ApiProperty({ example: 'Dune: Part Two' })
  title: string;

  @ApiProperty({ example: 2024 })
  year: number;

  @ApiProperty({ example: '/qom1SZSENdmHFNZBXbtfj0dKZRZ.jpg', nullable: true })
  posterPath: string | null;

  @ApiProperty({ example: 'Paul Atreides unite les tribus Fremen...', nullable: true })
  overview: string | null;

  @ApiProperty({ example: false })
  watched: boolean;

  @ApiProperty({ example: '2024-03-15T10:30:00.000Z', nullable: true })
  watchedAt: Date | null;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;
}
