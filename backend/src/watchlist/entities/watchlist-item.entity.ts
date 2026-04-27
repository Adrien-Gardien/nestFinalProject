export interface WatchlistItemEntity {
  id: string;
  userId: string;
  tmdbId: number | null;
  title: string;
  year: number;
  posterPath: string | null;
  overview: string | null;
  watched: boolean;
  watchedAt: Date | null;
  createdAt: Date;
}
