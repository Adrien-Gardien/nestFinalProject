import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import type {
  TmdbGenre,
  TmdbMovieDetail,
  TmdbMovieListResponse,
} from './entities/tmdb-movie.entity';

@Injectable()
export class MoviesService {
  private readonly baseUrl = 'https://api.themoviedb.org/3';

  private get headers() {
    return {
      Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN ?? ''}`,
      'Content-Type': 'application/json',
    };
  }

  private async tmdbFetch<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, { headers: this.headers });

    if (res.status === 404) {
      throw new NotFoundException('Film introuvable sur TMDb');
    }

    if (!res.ok) {
      throw new InternalServerErrorException('Erreur lors de la communication avec TMDb');
    }

    return res.json() as Promise<T>;
  }

  search(query: string, page = 1): Promise<TmdbMovieListResponse> {
    const q = encodeURIComponent(query);
    return this.tmdbFetch<TmdbMovieListResponse>(
      `/search/movie?query=${q}&language=fr-FR&page=${page}&include_adult=false`,
    );
  }

  discover(sortBy = 'popularity.desc', page = 1, genreId?: number): Promise<TmdbMovieListResponse> {
    let path = `/discover/movie?sort_by=${sortBy}&language=fr-FR&page=${page}&include_adult=false`;

    // on exige au moins 50 votes pour éviter les films obscurs quand on trie par note
    if (sortBy === 'vote_average.desc') {
      path += '&vote_count.gte=100';
    }

    if (genreId) {
      path += `&with_genres=${genreId}`;
    }

    return this.tmdbFetch<TmdbMovieListResponse>(path);
  }

  getById(id: number): Promise<TmdbMovieDetail> {
    return this.tmdbFetch<TmdbMovieDetail>(`/movie/${id}?language=fr-FR`);
  }

  async getGenres(): Promise<TmdbGenre[]> {
    const data = await this.tmdbFetch<{ genres: TmdbGenre[] }>(
      '/genre/movie/list?language=fr-FR',
    );
    return data.genres;
  }
}
