import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import type {
  TmdbGenre,
  TmdbMovieDetail,
  TmdbMovieListResponse,
} from './entities/tmdb-movie.entity';

// Adrien : ce service est un simple proxy vers l'API TMDb.
// On ne touche pas la base de données, tout passe par fetch.
@Injectable()
export class MoviesService {
  private readonly baseUrl = 'https://api.themoviedb.org/3';

  // Adrien : le token d'accès lecture TMDb vient de la variable d'env TMDB_ACCESS_TOKEN
  private get headers() {
    return {
      Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN ?? ''}`,
      'Content-Type': 'application/json',
    };
  }

  // Adrien : appel générique vers TMDb, centralise la gestion d'erreur
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

  // Adrien : recherche full-text via l'endpoint /search/movie de TMDb
  search(query: string, page = 1): Promise<TmdbMovieListResponse> {
    const q = encodeURIComponent(query);
    return this.tmdbFetch<TmdbMovieListResponse>(
      `/search/movie?query=${q}&language=fr-FR&page=${page}&include_adult=false`,
    );
  }

  // Adrien : découverte de films triés/filtrés via /discover/movie
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

  // Adrien : fiche complète d'un film (genres, durée, budget…)
  getById(id: number): Promise<TmdbMovieDetail> {
    return this.tmdbFetch<TmdbMovieDetail>(`/movie/${id}?language=fr-FR`);
  }

  // Adrien : liste des genres pour alimenter les filtres côté front
  async getGenres(): Promise<TmdbGenre[]> {
    const data = await this.tmdbFetch<{ genres: TmdbGenre[] }>(
      '/genre/movie/list?language=fr-FR',
    );
    return data.genres;
  }
}
