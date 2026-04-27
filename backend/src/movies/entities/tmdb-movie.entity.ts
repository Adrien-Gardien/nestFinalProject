// Adrien : interfaces qui reflètent la réponse brute de l'API TMDb (on ne stocke rien en base)

export interface TmdbMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
}

export interface TmdbMovieDetail extends Omit<TmdbMovie, 'genre_ids'> {
  runtime: number | null;
  tagline: string;
  status: string;
  budget: number;
  revenue: number;
  genres: TmdbGenre[];
}

export interface TmdbGenre {
  id: number;
  name: string;
}

export interface TmdbMovieListResponse {
  page: number;
  results: TmdbMovie[];
  total_pages: number;
  total_results: number;
}
