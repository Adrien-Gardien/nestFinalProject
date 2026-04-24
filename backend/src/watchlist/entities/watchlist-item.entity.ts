export interface WatchlistItemEntity {
  id: string;
  userId: string;
  title: string;
  year: number;
  watched: boolean;
  watchedAt: Date | null;
  createdAt: Date;
}
