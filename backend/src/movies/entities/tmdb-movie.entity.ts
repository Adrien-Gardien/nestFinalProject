import { ApiProperty } from '@nestjs/swagger';

export class TmdbGenre {
  @ApiProperty({ example: 28 })
  id: number;

  @ApiProperty({ example: 'Action' })
  name: string;
}

export class TmdbMovie {
  @ApiProperty({ example: 693134 })
  id: number;

  @ApiProperty({ example: 'Dune: Part Two' })
  title: string;

  @ApiProperty({ example: 'Paul Atreides unit les tribus Fremen...' })
  overview: string;

  @ApiProperty({ example: '/qom1SZSENdmHFNZBXbtfj0dKZRZ.jpg', nullable: true })
  poster_path: string | null;

  @ApiProperty({ example: '/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg', nullable: true })
  backdrop_path: string | null;

  @ApiProperty({ example: '2024-02-28' })
  release_date: string;

  @ApiProperty({ example: 8.3 })
  vote_average: number;

  @ApiProperty({ example: 4521 })
  vote_count: number;

  @ApiProperty({ example: [28, 12, 878] })
  genre_ids: number[];

  @ApiProperty({ example: 847.123 })
  popularity: number;
}

export class TmdbMovieDetail {
  @ApiProperty({ example: 693134 })
  id: number;

  @ApiProperty({ example: 'Dune: Part Two' })
  title: string;

  @ApiProperty({ example: 'Paul Atreides unit les tribus Fremen...' })
  overview: string;

  @ApiProperty({ example: '/qom1SZSENdmHFNZBXbtfj0dKZRZ.jpg', nullable: true })
  poster_path: string | null;

  @ApiProperty({ example: '/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg', nullable: true })
  backdrop_path: string | null;

  @ApiProperty({ example: '2024-02-28' })
  release_date: string;

  @ApiProperty({ example: 8.3 })
  vote_average: number;

  @ApiProperty({ example: 4521 })
  vote_count: number;

  @ApiProperty({ example: 166, nullable: true })
  runtime: number | null;

  @ApiProperty({ example: 'Long live the fighters.' })
  tagline: string;

  @ApiProperty({ example: 'Released' })
  status: string;

  @ApiProperty({ example: 190000000 })
  budget: number;

  @ApiProperty({ example: 711800000 })
  revenue: number;

  @ApiProperty({ example: 847.123 })
  popularity: number;

  @ApiProperty({ type: [TmdbGenre] })
  genres: TmdbGenre[];
}

export class TmdbMovieListResponse {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ type: [TmdbMovie] })
  results: TmdbMovie[];

  @ApiProperty({ example: 500 })
  total_pages: number;

  @ApiProperty({ example: 10000 })
  total_results: number;
}
